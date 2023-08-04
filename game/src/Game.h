#ifndef INCLUDE_GAME_H
#define INCLUDE_GAME_H

#include "Consts.h"
#include "achievements/BaseAchievement.h"

#include "api/API.hpp"
#include <chrono>
#include <deque>
#include <functional>
#include <json.hpp>
#include <random>
#include <vector>

using json = nlohmann::json;

typedef std::function<void(std::string)> SendFunc;
typedef std::function<void(std::string, std::string)> AuthSendFunc;
typedef std::function<void(std::string, std::string, SendFunc)> AuthSendFunc2;

inline bool isSignedIn(const API::ServerPlayer &player) {
    return (player.session.find("guest:") != 0);
}

struct HandlerArgs {
    SendFunc send;
    AuthSendFunc reportStats;
    AuthSendFunc2 reportStats2;
};

#define HANDLER_ARGS \
    SendFunc broadcast, HandlerArgs server, json &data, const ::std::string &session

class Game {
  public:
    Game();
    ~Game();
    Game(bool isPrivate) : Game() {
        this->state.private_session = isPrivate;
        this->state.victory = false;
        this->state.players.reserve(MAX_PLAYERS);
        this->state.rolls.resize(DICE_COUNT);
        this->state.used.resize(DICE_COUNT);
        for (uint i = 0; i < DICE_COUNT; ++i) {
            this->state.rolls[i] = 1;
            this->state.used[i] = false;
        }
    }

    // Rehydrate game from disk
    Game(const API::GameState &g) : Game(false) {
        this->state = g;
        for (auto &player : this->state.players) {
            player.connected = false;
        }
        if (this->state.players.size()) {
            turn_token = g.players[g.turn_index].session;
        }
    }

    bool isInitialized();
    bool isPrivate() const;
    std::string hostName() const;

    bool hasPlayer(std::string &id);
    json addPlayer(const PerSocketData &data);
    int getPlayerId(const std::string &id);

    json disconnectPlayer(std::string id);
    json reconnectPlayer(std::string id, std::string old_id, const PerSocketData& data);
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
    void skip(HANDLER_ARGS);
    void restart(HANDLER_ARGS);
    void update_name(HANDLER_ARGS);
    void roll(HANDLER_ARGS);
    void add(HANDLER_ARGS);
    void sub(HANDLER_ARGS);
    void add_nth(HANDLER_ARGS);
    void sub_nth(HANDLER_ARGS);
    void refetch_player(HANDLER_ARGS);

    void update(HANDLER_ARGS);

    int connectedPlayerCount();

    std::random_device rd;
    std::mt19937 gen;

    API::WelcomeMsg toWelcomeMsg() {
        std::vector<API::Player> players;
        for (const auto &player : this->state.players) {
            std::string user_id;
            if (isSignedIn(player)) {
                user_id = player.session;
            }
            players.emplace_back(player.connected, player.crowned, player.name, player.score, player.skip_count, std::make_shared<std::string>(user_id), player.win_count);
        }
        return API::WelcomeMsg{
            .chat_log = this->state.chat_log,
            .id = -1,
            .players = players,
            .private_session = this->state.private_session,
            .rolled = this->state.rolled,
            .rolls = this->state.rolls,
            .turn_index = this->state.turn_index,
            .used = this->state.used,
            .victory = this->state.victory};
    }

    std::string toString() const {
        return this->state.toString();
    }
    void processEvent(const API::ServerPlayer *player, SendFunc &broadcast, HandlerArgs *server, const json &data, const API::GameState &prev);

  private:
    std::uniform_int_distribution<int> dis{1, 6};
    std::chrono::system_clock::time_point updated = std::chrono::system_clock::now();
    std::string turn_token;
    std::vector<BaseAchievement *> achievements;
    API::GameState state;
};

#endif
