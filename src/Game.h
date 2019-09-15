#pragma once

#include "Consts.h"
#include "Player.h"

#include <functional>
#include <json.hpp>
#include <vector>

using json = nlohmann::json;

class Game {
   public:
    Game() : turn_index(0) { players.reserve(MAX_PLAYERS); }

    bool isInitialized();

    bool hasPlayer(std::string id);
    bool addPlayer(std::string id);

    bool disconnectPlayer(std::string id);

    void handleMessage(std::function<void(std::string)> send,
                       std::function<void(std::string)> broadcast, json& data,
                       const std::string& session);

    int connectedPlayerCount();

   private:
    std::vector<Player> players;
    int turn_index;
    int roll[DICE_COUNT];
    bool used[DICE_COUNT];
};

class GameError {
   public:
    GameError(std::string err) : err(err) {}

    const std::string& what() { return err; }

   private:
    std::string err;
};
