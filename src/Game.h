#pragma once

#include "Consts.h"
#include "Player.h"

#include <functional>
#include <json.hpp>
#include <vector>

using json = nlohmann::json;

typedef std::function<void(std::string)> SendFunc;

#define HANDLER_ARGS \
    SendFunc send, SendFunc broadcast, json &data, const ::std::string &session

class Game {
   public:
    Game() : turn_index(0) { players.reserve(MAX_PLAYERS); }

    bool isInitialized();

    bool hasPlayer(std::string id);
    bool addPlayer(std::string id);

    bool disconnectPlayer(std::string id);

    void handleMessage(HANDLER_ARGS);

    void chat(HANDLER_ARGS);

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

    const std::string &what() { return err; }

   private:
    std::string err;
};
