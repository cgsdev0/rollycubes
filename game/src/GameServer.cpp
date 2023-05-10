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

#include "App.h"
#include "Consts.h"
#include "Game.h"
#include "StringUtils.h"

#include "AuthServerRequestQueue.h"
#include "GameCoordinator.h"
#include "JWTVerifier.h"
#include "MoveOnlyFunction.h"
#include "api/API.hpp"

#include <prometheus/counter.h>
#include <prometheus/registry.h>
#include <prometheus/text_serializer.h>

// for convenience
using json = nlohmann::json;

typedef uWS::HttpResponse<false> HttpResponse;
typedef uWS::HttpRequest HttpRequest;

std::function<void(void)> signal_handler;
void signal_callback_handler(int signum) {
    signal_handler();
}

std::string getSession(HttpRequest *req) {
    const std::regex sessionRegex("_session=([^;]*)");
    std::smatch cookies;
    std::string s(req->getHeader("cookie"));
    std::regex_search(s, cookies, sessionRegex);
    return "guest:" + std::string(cookies[1].str());
}

void connectNewPlayer(uWS::App *app, uWS::WebSocket<false, true, PerSocketData> *ws, PerSocketData *userData, GameCoordinator &coordinator) {
    auto it = coordinator.games.find(userData->room);
    if (it != coordinator.games.end()) {
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
        userData->room = coordinator.createRoom(true, userData->room);
        API::Redirect msg;
        msg.room = userData->room;
        ws->send(msg.toString(), uWS::OpCode::TEXT);
    }
}

uWS::App::WebSocketBehavior<PerSocketData> makeWebsocketBehavior(uWS::App *app, const JWTVerifier &jwt_verifier, AuthServerRequestQueue &authServer, std::shared_ptr<prometheus::Registry> registry, GameCoordinator &coordinator) {

    auto &ws_counter = prometheus::BuildGauge()
                           .Name("websocket_conn_total")
                           .Help("Number of websocket connections total")
                           .Register(*registry)
                           .Add({});

    return {/* Settings */
            .compression = uWS::SHARED_COMPRESSOR,
            .maxPayloadLength = 16 * 1024,
            /* Handlers */
            .upgrade =
                [&, app](auto *res, auto *req, auto *context) {
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
                    auto it = coordinator.games.find(room);
                    if (it != coordinator.games.end()) {
                        // Connecting to a valid game
                        Game *g = it->second;
                        if (g->isPlayerConnected(session)) {
                            dedupe_conns = true;
                        }
                    }
                    res->template upgrade<PerSocketData>(
                        {.session = session,
                         .room = room,
                         .display_name = "",
                         .user_id = "",
                         .is_verified = is_verified,
                         .spectator = (mode == "spectate"),
                         .dedupe_conns = dedupe_conns},
                        req->getHeader("sec-websocket-key"),
                        req->getHeader("sec-websocket-protocol"),
                        req->getHeader("sec-websocket-extensions"),
                        context);
                },
            .open =
                [&, app](auto *ws) {
                    ws_counter.Increment();
                    PerSocketData *userData =
                        (PerSocketData *)ws->getUserData();

                    if (userData->session == "guest:") {
                        ws->send("cookie", uWS::OpCode::TEXT);
                        userData->is_verified = false;
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
                    connectNewPlayer(app, ws, userData, coordinator);
                },
            .message =
                [&, app](auto *ws, std::string_view message, uWS::OpCode opCode) {
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
                            throw API::GameError({.error = "Type is not specified correctly"});
                        auto action_type = data["type"].get<std::string>();
                        if (action_type == "authenticate") {
                            auto token = data["access_token"].get<std::string>();
                            try {
                                auto claim = jwt_verifier.decode_and_verify(token);
                                userData->is_verified = true;
                                userData->user_id = claim.user_id;
                                userData->display_name = claim.display_name;
                                connectNewPlayer(app, ws, userData, coordinator);

                            } catch (const std::runtime_error &e) {
                                std::cout << "authentication error\n"
                                          << e.what() << std::endl;
                                ws->close();
                            }
                        } else {
                            // Toss out any messages from unverified connection
                            if (!userData->is_verified) return;
                            auto it = coordinator.games.find(room);
                            if (it != coordinator.games.end()) {
                                Game *g = it->second;
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
                            } else {
                                response = API::GameError({.error = "Room not found: " + room}).toString();
                            }
                        }
                    } catch (API::GameError &e) {
                        response = e.toString();
                    } catch (nlohmann::detail::parse_error &e) {
                        std::cout << "RECEIVED BAD JSON (parse_error): " << message
                                  << std::endl
                                  << e.what() << std::endl;
                        response = API::GameError({.error = e.what()}).toString();
                    } catch (nlohmann::detail::type_error &e) {
                        std::cout << "HANDLED BAD JSON (type_error): " << message
                                  << std::endl
                                  << e.what() << std::endl;
                        response = API::GameError({.error = e.what()}).toString();
                    }
                    if (response.length())
                        ws->send(response, uWS::OpCode::TEXT);
                },
            .close =
                [&, app](auto *ws, int code, std::string_view message) {
                    PerSocketData *userData =
                        (PerSocketData *)ws->getUserData();
                    ws_counter.Decrement();

                    if (userData->spectator) return;
                    if (userData->dedupe_conns) return;

                    std::string room = userData->room;
                    std::string session = userData->session;
                    auto it = coordinator.games.find(room);
                    if (it != coordinator.games.end()) {
                        Game *g = it->second;
                        json resp = g->disconnectPlayer(session);
                        if (!resp.is_null()) {
                            app->publish(room, resp.dump(), uWS::OpCode::TEXT);
                        }
                        if (!g->connectedPlayerCount()) {
                            coordinator.queue_eviction(room);
                        }
                    }
                }};
}

int main(int argc, char **argv) {

    GameCoordinator coordinator;
    signal_handler = [&]() {
        std::cout << "Caught signal, attempting graceful shutdown..." << std::endl;
        coordinator.save_to_disk();
        exit(0);
    };

    signal(SIGINT, signal_callback_handler);
    signal(SIGTERM, signal_callback_handler);

    int port = DEFAULT_PORT;
    if (argc == 2) {
        // try to read a port as arg 2
        port = atoi(argv[1]);
    }
    try {
        coordinator.load_persistence();
    } catch (const std::exception &e) {
        std::cout << "WARNING: Failed to load server state from persistence!" << std::endl;
        std::cout << e.what() << std::endl;
    }

    std::string authServerUrl("http://auth:3031/server/");
    std::string devAuthServerUrl("http://localhost:3031/server/");

    std::string baseAuthUrl;

    if (std::getenv("DEV")) {
        baseAuthUrl = devAuthServerUrl;
    } else {
        baseAuthUrl = authServerUrl;
    }

    bool auth_enabled = true;
    if (std::getenv("NO_AUTH")) {
        auth_enabled = false;
    }

    JWTVerifier jwt_verifier;

    if (auth_enabled) {
        std::cout << "Selected auth server URL: " << baseAuthUrl << std::endl;
        jwt_verifier.init(baseAuthUrl);
    }

    AuthServerRequestQueue authServer(baseAuthUrl, uWS::Loop::get());

    auto registry = std::make_shared<prometheus::Registry>();

    uWS::App app;
    app.get("/metrics", [&](auto *res, auto *req) {
           const prometheus::TextSerializer serializer;
           auto metrics = registry->Collect();
           res->write(serializer.Serialize(metrics));
           res->end();
       })
        .get("/list", [&](auto *res, auto *req) {
            res->writeHeader("Content-Type", "application/json");
            res->write(coordinator.list_rooms().toString());
            res->end();
        })
        .get("/create", [&](auto *res, auto *req) {
            std::string session = getSession(req);
            bool isPrivate = true;
            if (req->getQuery().find("public") != std::string::npos) {
                isPrivate = false;
            }
            if (session == "") {
                res->end();
            } else {
                res->end(coordinator.createRoom(isPrivate));
            }
        })
        .ws<PerSocketData>("/ws/:mode/:room", makeWebsocketBehavior(&app, jwt_verifier, authServer, registry, coordinator))
        .listen(port, [port](auto *socket) {
            if (socket) {
                std::cout << "Listening on port " << port << std::endl;
            }
        })
        .run();

    std::cout << "Failed to listen on port " << port << std::endl;
}
