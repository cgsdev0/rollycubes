#include <chrono>
#include <cstdlib>
#include <ctime>
#include <fstream>
#include <iomanip>
#include <iostream>
#include <json.hpp>
#include <queue>
#include <random>
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
#include "Player.h"

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

std::unordered_set<std::string> eviction_set;
std::queue<std::pair<std::chrono::system_clock::time_point, std::string>>
    eviction_queue;

typedef uWS::HttpResponse<false> HttpResponse;
typedef uWS::HttpRequest HttpRequest;

void signal_callback_handler(int signum) {
    std::cout << "Caught signal, attempting graceful shutdown..." << std::endl;
    json state;
    for (const auto &g : games) {
        state[g.first] = g.second->toJson(true);
    }
    remove("server_state.json");
    std::ofstream state_file("server_state.json");
    if (!state.is_null()) {
        state_file << state;
        state_file.close();
    }
    exit(0);
}

void load_persistence() {
    std::ifstream state_file("server_state.json");
    if (!state_file.is_open()) return;
    json state;
    state_file >> state;
    state_file.close();
    std::cout << "Successfully parsed state file! Rehydrating..." << std::endl;
    for (auto &room : state.items()) {
        std::cout << "Restoring room '" << room.key() << "'" << std::endl;
        Game *g = new Game(room.value());
        games.insert({room.key(), g});
    }
}

unsigned int srandom_char(std::mt19937 &gen, int k = 255) {
    std::uniform_int_distribution<> dis(0, k);
    return dis(gen);
}

unsigned int random_char(int k = 255) {
    std::random_device rd;
    std::mt19937 gen(rd());
    std::uniform_int_distribution<> dis(0, k);
    return dis(gen);
}

std::string generate_code(const unsigned int len, std::string seed = "") {
    std::seed_seq s(seed.begin(), seed.end());
    std::mt19937 gen(s);
    const std::string chars =
        "abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUV23456789";
    const unsigned int l = chars.length() - 1;
    std::stringstream ss;
    for (auto i = 0; i < len; i++) {
        ss << chars[seed == "" ? random_char(l) : srandom_char(gen, l)];
    }
    return ss.str();
}
std::string generate_hex(const unsigned int len) {
    std::stringstream ss;
    for (auto i = 0; i < len; i++) {
        const auto rc = random_char();
        std::stringstream hexstream;
        hexstream << std::hex << rc;
        auto hex = hexstream.str();
        ss << (hex.length() < 2 ? '0' + hex : hex);
    }
    return ss.str();
}

void runEviction() {
    bool popSet = true;
    int kills = 0;
    while (!eviction_queue.empty()) {
        if (kills >= EVICTION_LIMIT)
            break;
        auto i = eviction_queue.front();
        if (i.first < std::chrono::system_clock::now() - EVICT_AFTER) {
            auto it = games.find(i.second);
            if (it != games.end()) {
                Game *g = it->second;
                if (!g->connectedPlayerCount()) {
                    if (g->getUpdated() < i.first) {
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
    std::cout << "Evicted " << kills << " games during creation of room ";
}

std::string getSession(HttpRequest *req) {
    const std::regex sessionRegex("_session=([^;]*)");
    std::smatch cookies;
    std::string s(req->getHeader("cookie"));
    std::regex_search(s, cookies, sessionRegex);
    return std::string(cookies[1].str());
}

/* ws->getUserData returns one of these */
struct PerSocketData {
    std::string session;
    std::string room;
};

std::string createRoom(bool isPrivate, std::string seed = "") {
    runEviction();
    std::string id;
    do {
        id = generate_code(ROOM_LEN, seed);
        if (games.find(id) != games.end() && seed != "") {
            // Short circuit to prevent infinite loop
            // in the case of a seeded redirect already
            // existing
            std::cout << id << " (noop)" << std::endl;
            return id;
        }
    } while (games.find(id) != games.end());
    std::cout << id << std::endl;
    std::cout << "New room count: " << games.size() << std::endl;
    Game *g = new Game(isPrivate);
    games.insert({id, g});
    if (!eviction_set.count(id)) {
        eviction_queue.push({std::chrono::system_clock::now(), id});
        eviction_set.insert(id);
    }
    return id;
}

/* Very simple WebSocket echo server */
int main(int argc, char **argv) {
    signal(SIGINT, signal_callback_handler);
    signal(SIGTERM, signal_callback_handler);

    int port = DEFAULT_PORT;
    if (argc == 2) {
        // try to read a port as arg 2
        port = atoi(argv[1]);
    }
    load_persistence();
    uWS::App()
        .get("/cookie",
             [](auto *res, auto *req) {
                 std::string session = getSession(req);
                 if (session == "") {
                     session = generate_hex(SESSION_BYTES);
                     res->writeHeader("Set-Cookie", "_session=" + session);
                 }
                 res->end();
             })
        .get("/list",
             [](auto *res, auto *req) {
                 res->writeHeader("Content-Type", "application/json");
                 json respList = json::array();
                 for (auto const &[code, game] : games) {
                     if (game->isPrivate()) {
                         continue;
                     }
                     std::string updated = serializeTimePoint(
                         game->getUpdated(), "UTC: %Y-%m-%d %H:%M:%S");
                     respList.push_back(
                         {{"code", code},
                          {"playerCount", game->connectedPlayerCount()},
                          {"lastUpdated", updated},
                          {"hostName", game->hostName()}});
                 }
                 res->write(respList.dump());
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
            "/ws/:room",
            {/* Settings */
             .compression = uWS::SHARED_COMPRESSOR,
             .maxPayloadLength = 16 * 1024,
             /* Handlers */
             .open =
                 [](auto *ws, auto *req) {
                     PerSocketData *userData =
                         (PerSocketData *)ws->getUserData();
                     new (userData) PerSocketData();
                     std::string session = getSession(req);
                     if (session == "") {
                         ws->close();
                     } else {
                         std::string room = std::string(req->getParameter(0));
                         auto it = games.find(room);
                         if (it != games.end()) {
                             // Connecting to a valid game
                             Game *g = it->second;
                             if (!g->hasPlayer(session)) {
                                 json resp = g->addPlayer(session);
                                 if (resp.is_null()) {
                                     // room is full
                                     ws->close();
                                     return;
                                 } else {
                                     ws->publish(room, resp.dump());
                                 }
                             } else {
                                 json resp = g->reconnectPlayer(session);
                                 ws->publish(room, resp.dump());
                             }
                             userData->room = std::string(room);
                             userData->session = std::string(session);
                             json welcome;
                             welcome["type"] = "welcome";
                             welcome["game"] = g->toJson();
                             welcome["id"] = g->getPlayerId(session);
                             ws->send(welcome.dump());
                             ws->subscribe(room);
                         } else {
                             // Connecting to a non-existant room
                             // let's migrate them to a new room
                             room = createRoom(true, room);
                             json route;
                             route["type"] = "redirect";
                             route["room"] = room;
                             userData->room = std::string(room);
                             userData->session = std::string(session);
                             ws->send(route.dump());
                         }
                     }
                 },
             .message =
                 [](auto *ws, std::string_view message, uWS::OpCode opCode) {
                     PerSocketData *userData =
                         (PerSocketData *)ws->getUserData();
                     std::string room = userData->room;
                     std::string session = userData->session;
                     json response;
                     try {
                         auto data = json::parse(message);
                         auto it = games.find(room);
                         if (it != games.end()) {
                             Game *g = it->second;
                             try {
                                 g->handleMessage(
                                     [&ws](auto s) { ws->send(s); },
                                     [&ws, &room](auto s) {
                                         ws->publish(room, s);
                                     },
                                     data, session);
                                 /*if (data["type"].is_string()) {
                                     if (data["type"] == "leave") {
                                         ws->close();
                                     }
                                 }*/
                             } catch (GameError &e) {
                                 response["error"] = e.what();
                             }
                         } else {
                             response["error"] = "Room not found: " + room;
                         }
                     } catch (nlohmann::detail::parse_error &e) {
                         std::cout << "RECEIVED BAD JSON (parse_error): " << message
                                   << std::endl
                                   << e.what() << std::endl;
                         response["error"] = e.what();
                     } catch (nlohmann::detail::type_error &e) {
                         std::cout << "HANDLED BAD JSON (type_error): " << message
                                   << std::endl
                                   << e.what() << std::endl;
                         response["error"] = e.what();
                     }
                     if (!response.is_null())
                         ws->send(response.dump());
                 },
             .drain =
                 [](auto *ws) {
                     /* Check getBufferedAmount here */
                 },
             .ping =
                 [](auto *ws) {

                 },
             .pong =
                 [](auto *ws) {

                 },
             .close =
                 [](auto *ws, int code, std::string_view message) {
                     PerSocketData *userData =
                         (PerSocketData *)ws->getUserData();
                     std::string room = userData->room;
                     std::string session = userData->session;
                     auto it = games.find(room);
                     if (it != games.end()) {
                         Game *g = it->second;
                         json resp = g->disconnectPlayer(session);
                         if (!resp.is_null()) {
                             ws->publish(room, resp.dump());
                         }
                         if (!g->connectedPlayerCount()) {
                             if (!eviction_set.count(room)) {
                                 eviction_queue.push(
                                     {std::chrono::system_clock::now(), room});
                                 eviction_set.insert(room);
                             }
                         }
                     }
                     userData->~PerSocketData();
                 }})
        .listen(port,
                [port](auto *token) {
                    if (token) {
                        std::cout << "Listening on port " << port << std::endl;
                    }
                })
        .run();

    std::cout << "Failed to listen on port " << port << std::endl;
}
