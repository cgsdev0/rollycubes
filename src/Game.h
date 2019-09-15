#pragma once

#include "Consts.h"
#include "Player.h"

#include <functional>
#include <json.hpp>
#include <random>
#include <vector>

using json = nlohmann::json;

typedef std::function<void(std::string)> SendFunc;

#define HANDLER_ARGS \
    SendFunc send, SendFunc broadcast, json &data, const ::std::string &session

class Game {
   public:
    Game() : dis(1, 6), victory(false), rolled(false) {
        players.reserve(MAX_PLAYERS);
        for (int i = 0; i < DICE_COUNT; ++i) {
            rolls[i] = 1;
            used[i] = false;
        }
    }

    bool isInitialized();

    bool hasPlayer(std::string id);
    json addPlayer(std::string id);

    json disconnectPlayer(std::string id);
    json reconnectPlayer(std::string id);

    void advanceTurn();
    void clearTurn();

    int totalRoll();
    bool isSplit();
    bool isDoubles();
    bool allUsed();

    void guardUpdate(const std::string &session);
    int guardNth(const json &data);

    void handleMessage(HANDLER_ARGS);

    void chat(HANDLER_ARGS);
    void leave(HANDLER_ARGS);
    void kick(HANDLER_ARGS);
    void restart(HANDLER_ARGS);
    void update_name(HANDLER_ARGS);
    void roll(HANDLER_ARGS);
    void add(HANDLER_ARGS);
    void sub(HANDLER_ARGS);
    void add_nth(HANDLER_ARGS);
    void sub_nth(HANDLER_ARGS);

    void update(HANDLER_ARGS);

    int connectedPlayerCount();

    json toJson();

   private:
    std::vector<Player> players;
    std::string turn_token;
    int turn_index;
    int rolls[DICE_COUNT];
    bool used[DICE_COUNT];
    std::uniform_int_distribution<int> dis;
    bool rolled;
    bool victory;
};

class GameError {
   public:
    GameError(std::string err) : err(err) {}

    const std::string &what() { return err; }

   private:
    std::string err;
};
