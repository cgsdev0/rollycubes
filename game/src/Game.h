#ifndef INCLUDE_GAME_H
#define INCLUDE_GAME_H

#include "Consts.h"
#include "Metrics.h"
#include "RichTextStream.h"
#include "achievements/BaseAchievement.h"

#include <chrono>
#include <functional>
#include <json.hpp>
#include <string>

#include <vector>

using json = nlohmann::json;

typedef std::function<void(std::string)> SendFunc;
typedef std::function<void(std::string, std::string)> AuthSendFunc;
typedef std::function<void(std::string, std::string, SendFunc)> AuthSendFunc2;
typedef std::function<std::vector<int>()> RollFunc;

class GameCoordinator;
struct HandlerArgs {
    SendFunc send;
    AuthSendFunc reportStats;
    AuthSendFunc2 reportStats2;
    RollFunc do_a_roll;
};

#define HANDLER_ARGS \
    SendFunc broadcast, HandlerArgs server, json &data, const ::std::string &session

class Game {
  public:
    Game();
    ~Game();
    Game(bool isPrivate) : Game() {
        this->state.private_session = isPrivate;
    }

    // Rehydrate game from disk
    Game(const API::GameState &g) : Game(false) {
        this->state = g;
        for (auto &player : this->state.players) {
            player.connected = false;
            if (player.sum_hist.size() != 12) {
                player.sum_hist = {0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0};
            }
            if (player.dice_hist.size() != 6) {
                player.dice_hist = {0, 0, 0, 0, 0, 0};
            }
            if (player.win_hist.size() != 6) {
                player.win_hist = {0, 0, 0, 0, 0, 0};
            }
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
    json reconnectPlayer(std::string id, std::string old_id, const PerSocketData &data);
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

    API::WelcomeMsg toWelcomeMsg() {
        std::vector<API::Player> players;
        for (const auto &player : this->state.players) {
            std::string user_id;
            if (isSignedIn(player)) {
                user_id = player.session;
            }
            auto uid = std::optional<std::string>{user_id};
            if (!user_id.length()) {
                uid = std::nullopt;
            }
            players.emplace_back(player.connected, player.crowned, player.name, player.score, player.skip_count, uid, player.win_count);
        }
        return API::WelcomeMsg{
            .chat_log = this->state.chat_log,
            .id = -1,
            .players = players,
            .private_session = this->state.private_session,
            .rich_chat_log = this->state.rich_chat_log,
            .rolled = this->state.rolled,
            .rolls = this->state.rolls,
            .spectators = this->state.spectators,
            .turn_index = this->state.turn_index,
            .used = this->state.used,
            .victory = this->state.victory};
    }

    std::string toString() const {
        return this->state.toString();
    }

    int64_t incrSpectators() {
        return ++this->state.spectators;
    }

    int64_t decrSpectators() {
        return --this->state.spectators;
    }

    void processEvent(const API::ServerPlayer *player, SendFunc &broadcast, HandlerArgs *server, const json &data, const API::GameState &prev);

  private:
    std::string log_rich_chat(const RichTextStream &stream) {
        state.rich_chat_log.insert(state.rich_chat_log.begin(), stream.obj());
        if (state.rich_chat_log.size() > MAX_CHAT_LOG) {
            state.rich_chat_log.pop_back();
        }
        return stream.str();
    }
    std::chrono::system_clock::time_point updated = std::chrono::system_clock::now();
    std::chrono::system_clock::time_point turn_start_time = std::chrono::system_clock::now();
    std::string turn_token;
    std::vector<BaseAchievement *> achievements;
    API::GameState state;
    Metrics *metrics;
    std::vector<std::byte> events;
    std::vector<std::string> user_palette;
    bool was_persisted = false;
    friend GameCoordinator;
};

#endif
