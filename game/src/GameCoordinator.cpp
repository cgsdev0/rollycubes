#include "GameCoordinator.h"
#include "Consts.h"
#include "StringUtils.h"
#include <cstdlib>
#include <ctime>
#include <fstream>
#include <iomanip>
#include <iostream>
#include <json.hpp>

#include <regex>
#include <signal.h>
#include <sstream>
#include <streambuf>
#include <string_view>
#include <unistd.h>

// for convenience
using json = nlohmann::json;
using time_point = std::chrono::system_clock::time_point;

typedef uWS::HttpResponse<false> HttpResponse;
typedef uWS::HttpRequest HttpRequest;

static std::string serializeTimePoint(const time_point &time,
                                      const std::string &format) {
    std::time_t tt = std::chrono::system_clock::to_time_t(time);
    std::tm tm = *std::gmtime(&tt); // GMT (UTC)
    std::stringstream ss;
    ss << std::put_time(&tm, format.c_str());
    return ss.str();
}

API::RoomListMsg GameCoordinator::list_rooms() {
    API::RoomListMsg respList;
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
    return respList;
}

void GameCoordinator::load_persistence() {
    std::ifstream state_file("data/server_state.json");
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
        g->metrics = metrics;
        g->was_persisted = true;
        games.insert({room.key(), g});

        // // All rehydrated games start with 0 players, so we can schedule an eviction.
        eviction_queue.push({std::chrono::system_clock::now(), room.key()});
        eviction_set.insert(room.key());
    }
}

void GameCoordinator::runEviction(bool limited) {
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

void GameCoordinator::save_to_disk() {
    runEviction(false);
    json state;
    for (const auto &g : games) {
        state[g.first] = json::parse(g.second->toString());
    }
    remove("data/server_state.json");
    std::ofstream state_file("data/server_state.json");
    if (!state.is_null()) {
        state_file << state;
        state_file.close();
        std::cout << "Successfully persisted state to disk." << std::endl;
    }
}

std::string GameCoordinator::createRoom(bool isPrivate, std::string seed) {
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
    g->metrics = metrics;
    games.insert({id, g});
    if (!eviction_set.count(id)) {
        eviction_queue.push({std::chrono::system_clock::now(), id});
        eviction_set.insert(id);
    }
    return id;
}

void GameCoordinator::queue_eviction(std::string room) {
    if (!eviction_set.count(room)) {
        eviction_queue.push(
            {std::chrono::system_clock::now(), room});
        eviction_set.insert(room);
    }
}
