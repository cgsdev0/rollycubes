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

const unsigned int MAX_PLAYERS = 4;
const unsigned int DICE_COUNT = 2;
const unsigned int SESSION_BYTES = 16;
const unsigned int ROOM_LEN = 6;
const unsigned int PORT = 3001;
const std::chrono::system_clock::duration EVICT_AFTER = 60s;

class Player {
   public:
    Player() {}

   private:
    std::string session;
    std::string name;
    int score;
    int win_count;
    bool connected;
};

class Game {
   public:
    Game() : turn_index(0), player_count(0) {}

    bool isInitialized() { return player_count > 0; }

   private:
    Player players[MAX_PLAYERS];
    int player_count;
    int turn_index;
    int roll[DICE_COUNT];
    bool used[DICE_COUNT];
    bool initialized;
};

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
    const unsigned int l = chars.length();
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
        if (i.first < std::chrono::system_clock::now()) {
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
    return cookies[1].str();
}

/* ws->getUserData returns one of these */
struct PerSocketData {};

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
        .get("/create",
             [](auto *res, auto *req) {
                 std::string session = getSession(req);
                 if (session == "") {
                     res->end();
                 } else {
                     runEviction();
                     Game *g = new Game();
                     std::string id = generate_code(ROOM_LEN);
                     games.insert({id, g});
                     eviction_queue.push(
                         {std::chrono::system_clock::now() + EVICT_AFTER, id});
                     res->end(id);
                     std::cout << "New game session starting: " << id
                               << std::endl;
                 }
             })
        .ws<PerSocketData>(
            "/ws",
            {/* Settings */
             .compression = uWS::SHARED_COMPRESSOR,
             .maxPayloadLength = 16 * 1024,
             /* Handlers */
             .open =
                 [](auto *ws, auto *req) {
                     std::cout << getSession(req) << std::endl;
                     ws->send(std::to_string(sizeof(Game)), uWS::OpCode::TEXT);
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
                     std::cout << "CLOSING " << message << std::endl;
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
