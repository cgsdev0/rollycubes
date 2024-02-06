#ifndef INCLUDE_GAME_COORDINATOR_H
#define INCLUDE_GAME_COORDINATOR_BASE_H

#include "App.h"
#include "Game.h"
#include "api/API.hpp"
#include <chrono>
#include <queue>
#include <string>
#include <unordered_map>
#include <unordered_set>

class Metrics;

class GameCoordinator {

  public:
    GameCoordinator(Metrics *_metrics) : metrics(_metrics) { }
    std::unordered_map<std::string, Game *> games;

    std::unordered_set<std::string>
        eviction_set;
    std::queue<std::pair<std::chrono::system_clock::time_point, std::string>>
        eviction_queue;

    API::RoomListMsg list_rooms();
    void load_persistence();
    void runEviction(bool limited = true);
    void save_to_disk();
    std::string createRoom(bool isPrivate, std::string seed = "");
    void queue_eviction(std::string room);

  private:
    Metrics *metrics;
};

#endif // INCLUDE_GAME_COORDINATOR_H
