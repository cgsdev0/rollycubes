#include <chrono>
#include <fstream>
#include <iostream>
#include <queue>
#include <random>
#include <regex>
#include <sstream>
#include <streambuf>
#include <string>
#include <unordered_map>

#include "App.h"
#include "Consts.h"
#include "Game.h"
#include "Player.h"

std::unordered_map<std::string, Game *> games;
std::queue<std::pair<std::chrono::system_clock::time_point, std::string>>
    eviction_queue;

typedef uWS::HttpResponse<false> HttpResponse;
typedef uWS::HttpRequest HttpRequest;

unsigned int random_char(int k = 255) {
    std::random_device rd;
    std::mt19937 gen(rd());
    std::uniform_int_distribution<> dis(0, k);
    return dis(gen);
}

std::string generate_code(const unsigned int len) {
    const std::string chars =
        "abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUV23456789";
    const unsigned int l = chars.length() - 1;
    std::stringstream ss;
    for (auto i = 0; i < len; i++) {
        ss << chars[random_char(l)];
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
    while (!eviction_queue.empty()) {
        auto i = eviction_queue.front();
        if (i.first < std::chrono::system_clock::now() - EVICT_AFTER) {
            auto it = games.find(i.second);
            if (it != games.end()) {
                if (!it->second->isInitialized()) {
                    std::cout << "EVICTING GAME: " << i.second << std::endl;
                    Game *g = it->second;
                    games.erase(it);
                    delete g;
                }
            }
            eviction_queue.pop();
        } else {
            break;
        }
    }
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

/* Very simple WebSocket echo server */
int main() {
    /* Overly simple hello world app */
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
        .get(
            "/create",
            [](auto *res, auto *req) {
                std::string session = getSession(req);
                if (session == "") {
                    res->end();
                } else {
                    runEviction();
                    Game *g = new Game();
                    std::string id;
                    do {
                        id = generate_code(ROOM_LEN);
                        std::cout << "trying id " << id << std::endl;
                    } while (games.find(id) != games.end());
                    games.insert({id, g});
                    eviction_queue.push({std::chrono::system_clock::now(), id});
                    res->end(id);
                    std::cout << "New game session starting: " << id
                              << std::endl;
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
                         std::cout << "Closing: no session" << std::endl;
                     } else {
                         std::string room = std::string(req->getParameter(0));
                         std::cout << "Connection opening to room " << room
                                   << std::endl;
                         auto it = games.find(room);
                         if (it != games.end()) {
                             // Connecting to a valid game
                             Game *g = it->second;
                             if (!g->hasPlayer(session)) {
                                 g->addPlayer(session);
                                 userData->room = std::string(room);
                                 userData->session = std::string(session);
                             }
                             std::cout << "Socket initiated" << std::endl;
                         } else {
                             // Connecting to a non-existant room
                             std::cout << "Closing: invalid game" << std::endl;
                             ws->close();
                         }
                     }
                 },
             .message = [](auto *ws, std::string_view message,
                           uWS::OpCode opCode) { ws->send(message, opCode); },
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
                     std::cout << "CLOSING" << std::endl;
                     PerSocketData *userData =
                         (PerSocketData *)ws->getUserData();
                     if (!userData) {
                         std::cout << "shocking" << std::endl;
                     }
                     std::string room = userData->room;
                     std::string session = userData->session;
                     std::cout << "room: " << room << std::endl;
                     std::cout << "session: " << session << std::endl;
                     auto it = games.find(room);
                     if (it != games.end()) {
                         Game *g = it->second;
                         g->disconnectPlayer(session);
                         if (!g->connectedPlayerCount()) {
                             eviction_queue.push(
                                 {std::chrono::system_clock::now(), room});
                             std::cout << "Scheduling " << room
                                       << " for eviction" << std::endl;
                         }
                     }
                     std::cout << "CLOSED" << std::endl;
                     userData->~PerSocketData();
                 }})
        .listen(PORT,
                [](auto *token) {
                    if (token) {
                        std::cout << "Listening on port " << PORT << std::endl;
                    }
                })
        .run();

    std::cout << "Failed to listen on port " << PORT << std::endl;
}
