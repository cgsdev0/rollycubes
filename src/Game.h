#pragma once

#include "Consts.h"
#include "Player.h"

#include <chrono>
#include <deque>
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
    Game()
        : dis(1, 6),
          updated(std::chrono::system_clock::now()),
          victory(false),
          rolled(false) {
        players.reserve(MAX_PLAYERS);
        for (int i = 0; i < DICE_COUNT; ++i) {
            rolls[i] = 1;
            used[i] = false;
        }
    }

    bool isInitialized();

    bool hasPlayer(std::string &id);
    json addPlayer(std::string id);
    int getPlayerId(std::string &id);

    json disconnectPlayer(std::string id);
    json reconnectPlayer(std::string id);

    void advanceTurn();
    void clearTurn();

    std::chrono::system_clock::time_point getUpdated() { return this->updated; }

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
    std::deque<std::string> chatLog;
    std::string turn_token;
    std::uniform_int_distribution<int> dis;
    std::chrono::system_clock::time_point updated;
    int turn_index;
    int rolls[DICE_COUNT];
    bool used[DICE_COUNT];
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
