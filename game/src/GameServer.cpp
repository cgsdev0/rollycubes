
#include <chrono>
#include <cstdlib>
#include <ctime>
#include <fstream>
#include <iomanip>
#include <iostream>
#include <json.hpp>
#include <queue>

#include <regex>
#include <signal.h>
#include <sstream>
#include <streambuf>
#include <string>
#include <string_view>
#include <unistd.h>
#include <unordered_map>
#include <unordered_set>

#include "App.h"
#include "Consts.h"
#include "Game.h"
#include "StringUtils.h"

#include "API.h"
#include "AuthServerRequestQueue.h"
#include "JWTVerifier.h"
#include "MoveOnlyFunction.h"

// for convenience
using json = nlohmann::json;

using time_point = std::chrono::system_clock::time_point;
std::string serializeTimePoint(const time_point &time,
                               const std::string &format) {
    std::time_t tt = std::chrono::system_clock::to_time_t(time);
    std::tm tm = *std::gmtime(&tt); // GMT (UTC)
    std::stringstream ss;
    ss << std::put_time(&tm, format.c_str());
    return ss.str();
}

std::unordered_map<std::string, Game *> games;

std::unordered_set<std::string>
    eviction_set;
std::queue<std::pair<std::chrono::system_clock::time_point, std::string>>
    eviction_queue;

typedef uWS::HttpResponse<false> HttpResponse;
typedef uWS::HttpRequest HttpRequest;

void load_persistence() {
    std::ifstream state_file("server_state.json");
    if (!state_file.is_open()) return;
    json state;
    state_file >> state;
    state_file.close();
    std::cout << "Successfully parsed state file! Rehydrating..." << std::endl;
    for (auto &room : state.items()) {
        std::cout << "Restoring room '" << room.key() << "'" << std::endl;
        API::GameState state;
        state.fromString(room.value().dump());
        Game *g = new Game(state);
        games.insert({room.key(), g});

        // // All rehydrated games start with 0 players, so we can schedule an eviction.
        eviction_queue.push({std::chrono::system_clock::now(), room.key()});
        eviction_set.insert(room.key());
    }
}

void runEviction(bool limited = true) {
    bool popSet = true;
    uint kills = 0;
    while (!eviction_queue.empty()) {
        if (kills >= EVICTION_LIMIT && limited)
            break;
        auto i = eviction_queue.front();
        if (i.first < std::chrono::system_clock::now() - EVICT_AFTER) {
            auto it = games.find(i.second);
            if (it != games.end()) {
                Game *g = it->second;
                if (!g->connectedPlayerCount()) {
                    if (g->getUpdated() <= i.first) {
                        games.erase(it);
                        delete g;
                        ++kills;
                    } else {
                        eviction_queue.push(
                            {std::chrono::system_clock::now(), i.second});
                        popSet = false;
                    }
                }
            }
            if (popSet) {
                eviction_set.erase(i.second);
            }
            eviction_queue.pop();
        } else {
            break;
        }
    }
    std::cout << "Evicted " << kills << " games" << std::endl;
}

void signal_callback_handler(int signum) {
    std::cout << "Caught signal, attempting graceful shutdown..." << std::endl;
    runEviction(false);
    json state;
    for (const auto &g : games) {
        state[g.first] = json::parse(g.second->toString());
    }
    remove("server_state.json");
    std::ofstream state_file("server_state.json");
    if (!state.is_null()) {
        state_file << state;
        state_file.close();
        std::cout << "Successfully persisted state to disk." << std::endl;
    }
    exit(0);
}

std::string getSession(HttpRequest *req) {
    const std::regex sessionRegex("_session=([^;]*)");
    std::smatch cookies;
    std::string s(req->getHeader("cookie"));
    std::regex_search(s, cookies, sessionRegex);
    return "guest:" + std::string(cookies[1].str());
}

std::string createRoom(bool isPrivate, std::string seed = "") {
    runEviction();
    std::string id;
    do {
        id = generateCode(ROOM_LEN, seed);
        if (games.find(id) != games.end() && seed != "") {
            // Short circuit to prevent infinite loop
            // in the case of a seeded redirect already
            // existing
            return id;
        }
    } while (games.find(id) != games.end());
    Game *g = new Game(isPrivate);
    games.insert({id, g});
    if (!eviction_set.count(id)) {
        eviction_queue.push({std::chrono::system_clock::now(), id});
        eviction_set.insert(id);
    }
    return id;
}

void connectNewPlayer(uWS::App *app, uWS::WebSocket<false, true, PerSocketData> *ws, PerSocketData *userData) {
    auto it = games.find(userData->room);
    if (it != games.end()) {
        // Connecting to a valid game
        Game *g = it->second;
        if (!userData->spectator) {
            if (!g->hasPlayer(userData->session)) {
                json resp = g->addPlayer(*userData);
                if (resp.is_null()) {
                    // room is full
                    ws->close();
                    return;
                }
                app->publish(userData->room, resp.dump(), uWS::OpCode::TEXT);
            } else {
                json resp = g->reconnectPlayer(userData->session);
                app->publish(userData->room, resp.dump(), uWS::OpCode::TEXT);
            }
        }

        auto welcome = g->toWelcomeMsg();
        welcome.id = (userData->spectator) ? -1 : g->getPlayerId(userData->session);
        ws->send(welcome.toString(), uWS::OpCode::TEXT);
        ws->subscribe(userData->room);
    } else if (userData->spectator) {
        ws->close();
        return;
    } else {
        // Connecting to a non-existant room
        // let's migrate them to a new room
        userData->room = createRoom(true, userData->room);
        API::Redirect msg;
        msg.room = userData->room;
        ws->send(msg.toString(), uWS::OpCode::TEXT);
    }
}

uWS::App::WebSocketBehavior<PerSocketData> makeWebsocketBehavior(uWS::App *app, const JWTVerifier &jwt_verifier, AuthServerRequestQueue &authServer) {
    return {/* Settings */
            .compression = uWS::SHARED_COMPRESSOR,
            .maxPayloadLength = 16 * 1024,
            /* Handlers */
            .upgrade =
                [](auto *res, auto *req, auto *context) {
                    std::string session = getSession(req);
                    bool is_verified = true;
                    std::string mode = std::string(req->getParameter(0));
                    std::string room = std::string(req->getParameter(1));
                    std::string user_id = std::string(req->getQuery("userId"));
                    if (user_id.length()) {
                        session = user_id;
                        is_verified = false;
                    }
                    bool dedupe_conns = false;
                    auto it = games.find(room);
                    if (it != games.end()) {
                        // Connecting to a valid game
                        Game *g = it->second;
                        if (g->isPlayerConnected(session)) {
                            dedupe_conns = true;
                        }
                    }
                    res->template upgrade<PerSocketData>(
                        {.session = session,
                         .room = room,
                         .is_verified = is_verified,
                         .spectator = (mode == "spectate"),
                         .dedupe_conns = dedupe_conns},
                        req->getHeader("sec-websocket-key"),
                        req->getHeader("sec-websocket-protocol"),
                        req->getHeader("sec-websocket-extensions"),
                        context);
                },
            .open =
                [app](auto *ws) {
                    PerSocketData *userData =
                        (PerSocketData *)ws->getUserData();

                    if (userData->session == "") {
                        ws->close();
                        return;
                    }
                    if (userData->dedupe_conns) {
                        json resp;
                        resp["error"] = "already connected";
                        ws->send(resp.dump(), uWS::OpCode::TEXT);
                        return;
                    }
                    if (!userData->is_verified) {
                        // We shouldn't mutate the game state until we're sure this user is
                        // real.
                        return;
                    }
                    connectNewPlayer(app, ws, userData);
                },
            .message =
                [app, &jwt_verifier, &authServer](auto *ws, std::string_view message, uWS::OpCode opCode) {
                    PerSocketData *userData =
                        (PerSocketData *)ws->getUserData();

                    if (userData->dedupe_conns) return;
                    if (userData->spectator) return;

                    std::string room = userData->room;
                    std::string session = userData->session;
                    std::string response;
                    try {
                        auto data = json::parse(message);
                        if (!data["type"].is_string())
                            throw GameError("Type is not specified correctly");
                        auto action_type = data["type"].get<std::string>();
                        if (action_type == "authenticate") {
                            auto token = data["access_token"].get<std::string>();
                            try {
                                auto claim = jwt_verifier.decode_and_verify(token);
                                userData->is_verified = true;
                                userData->user_id = claim.user_id;
                                userData->display_name = claim.display_name;
                                connectNewPlayer(app, ws, userData);

                            } catch (const std::runtime_error &e) {
                                std::cout << "authentication error\n"
                                          << e.what() << std::endl;
                                ws->close();
                            }
                        } else {
                            // Toss out any messages from unverified connection
                            if (!userData->is_verified) return;
                            auto it = games.find(room);
                            if (it != games.end()) {
                                Game *g = it->second;
                                try {
                                    g->handleMessage(
                                        [ws, room, app](auto s) {
                                            // ws->send(s, uWS::OpCode::TEXT);
                                            app->publish(room, s, uWS::OpCode::TEXT);
                                        },
                                        {.send =
                                             [ws](auto s) { ws->send(s, uWS::OpCode::TEXT); },
                                         .reportStats = [&authServer](auto url, auto json) { authServer.send(url, json); },
                                         .reportStats2 = [&authServer](auto url, auto json, auto cb) { authServer.send(url, json, cb); }},
                                        data, session);
                                    /*if (data["type"].is_string()) {
                                  if (data["type"] == "leave") {
                                  ws->close();
                                  }
                                  }*/
                                } catch (GameError &e) {
                                    response = GameError(e.what()).toString();
                                }
                            } else {
                                response = GameError("Room not found: " + room).toString();
                            }
                        }
                    } catch (nlohmann::detail::parse_error &e) {
                        std::cout << "RECEIVED BAD JSON (parse_error): " << message
                                  << std::endl
                                  << e.what() << std::endl;
                        response = GameError(e.what()).toString();
                    } catch (nlohmann::detail::type_error &e) {
                        std::cout << "HANDLED BAD JSON (type_error): " << message
                                  << std::endl
                                  << e.what() << std::endl;
                        response = GameError(e.what()).toString();
                    }
                    if (response.length())
                        ws->send(response, uWS::OpCode::TEXT);
                },
            .close =
                [app](auto *ws, int code, std::string_view message) {
                    PerSocketData *userData =
                        (PerSocketData *)ws->getUserData();

                    if (userData->spectator) return;
                    if (userData->dedupe_conns) return;

                    std::string room = userData->room;
                    std::string session = userData->session;
                    auto it = games.find(room);
                    if (it != games.end()) {
                        Game *g = it->second;
                        json resp = g->disconnectPlayer(session);
                        if (!resp.is_null()) {
                            app->publish(room, resp.dump(), uWS::OpCode::TEXT);
                        }
                        if (!g->connectedPlayerCount()) {
                            if (!eviction_set.count(room)) {
                                eviction_queue.push(
                                    {std::chrono::system_clock::now(), room});
                                eviction_set.insert(room);
                            }
                        }
                    }
                }};
}

int main(int argc, char **argv) {
    signal(SIGINT, signal_callback_handler);
    signal(SIGTERM, signal_callback_handler);

    int port = DEFAULT_PORT;
    if (argc == 2) {
        // try to read a port as arg 2
        port = atoi(argv[1]);
    }
    try {
        load_persistence();
    } catch (const std::exception &e) {
        std::cout << "WARNING: Failed to load server state from persistence!" << std::endl;
        std::cout << e.what() << std::endl;
    }

    std::string devEnv(std::getenv("DEV"));
    std::string authServerUrl("http://auth:3031/");
    std::string devAuthServerUrl("http://localhost:3031/");

    std::string baseAuthUrl;
    if (!devEnv.size()) {
        baseAuthUrl = authServerUrl;
    } else {
        baseAuthUrl = devAuthServerUrl;
    }

    JWTVerifier jwt_verifier;
    jwt_verifier.init(baseAuthUrl);

    AuthServerRequestQueue authServer(baseAuthUrl, uWS::Loop::get());

    uWS::App app;
    app.get("/list",
            [](auto *res, auto *req) {
                res->writeHeader("Content-Type", "application/json");
                API::Room_List respList;
                for (auto const &[code, game] : games) {
                    if (game->isPrivate()) {
                        continue;
                    }
                    std::string updated = serializeTimePoint(
                        game->getUpdated(), "UTC: %Y-%m-%d %H:%M:%S");
                    respList.rooms.push_back(
                        {.code = code,
                         .host_name = game->hostName(),
                         .last_updated = updated,
                         .player_count = game->connectedPlayerCount()});
                }
                res->write(respList.toString());
                res->end();
            })
        .get("/create",
             [](auto *res, auto *req) {
                 std::string session = getSession(req);
                 bool isPrivate = true;
                 if (req->getQuery().find("public") != std::string::npos) {
                     isPrivate = false;
                 }
                 if (session == "") {
                     res->end();
                 } else {
                     res->end(createRoom(isPrivate));
                 }
             })
        .ws<PerSocketData>(
            "/ws/:mode/:room",
            makeWebsocketBehavior(&app, jwt_verifier, authServer))
        .listen(port,
                [port](auto *token) {
                    if (token) {
                        std::cout << "Listening on port " << port << std::endl;
                    }
                })
        .run();

    std::cout << "Failed to listen on port " << port << std::endl;
}
