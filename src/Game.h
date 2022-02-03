#ifndef INCLUDE_GAME_H
#define INCLUDE_GAME_H

#include "Consts.h"

#include "API.h"
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
    Game(bool isPrivate) {
        this->state.privateSession = true;
        this->state.players.reserve(MAX_PLAYERS);
        for (uint i = 0; i < DICE_COUNT; ++i) {
            this->state.rolls[i] = 1;
            this->state.used[i] = false;
        }
    }

    // Rehydrate game from disk
    Game(const API::GameState &g) {
        this->state = g;
        for (auto &player : this->state.players) {
            player.connected = false;
        }
        turn_token = g.players[g.turn_index].session;
    }

    bool isInitialized();
    bool isPrivate() const;
    std::string hostName() const;

    bool hasPlayer(std::string &id);
    json addPlayer(const PerSocketData &data);
    int getPlayerId(std::string &id);

    json disconnectPlayer(std::string id);
    json reconnectPlayer(std::string id);
    bool isPlayerConnected(std::string id) const;

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

    API::Welcome toWelcomeMsg() {
        return API::Welcome(this->state);
    }

    std::string toString() const {
        return this->state.toString();
    }

  private:
    std::uniform_int_distribution<int> dis{1, 6};
    std::chrono::system_clock::time_point updated = std::chrono::system_clock::now();
    std::string turn_token;
    API::GameState state;
};

#endif