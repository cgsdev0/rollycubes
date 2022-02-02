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
    Game(bool isPrivate)
        : privateSession(isPrivate) {
        players.reserve(MAX_PLAYERS);
        for (uint i = 0; i < DICE_COUNT; ++i) {
            rolls[i] = 1;
            used[i] = false;
        }
    }

    Game(json state) {
        players.reserve(MAX_PLAYERS);
        for (uint i = 0; i < DICE_COUNT; ++i) {
            this->rolls[i] = state["rolls"].at(i);
            this->used[i] = state["used"].at(i);
        }
        this->chatLog = state["chat"].get<std::deque<std::string>>();
        this->turn_index = state["turn_index"];
        this->turn_token = state["turn_token"];
        this->privateSession = state["private"];
        this->rolled = state["rolled"];
        this->victory = state["victory"];

        for (auto &p : state["players"]) {
            this->players.emplace_back(p);
        }
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

    json toJson(bool withSecrets = false) const;

  private:
    std::vector<Player> players;
    std::deque<std::string> chatLog;
    std::string turn_token;
    std::uniform_int_distribution<int> dis{1, 6};
    std::chrono::system_clock::time_point updated = std::chrono::system_clock::now();
    uint turn_index = 0;
    int rolls[DICE_COUNT];
    bool used[DICE_COUNT];
    bool rolled = false;
    bool victory = false;
    bool privateSession;
};
