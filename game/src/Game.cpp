#include <algorithm>
#include <iostream>
#include <unordered_map>

#include "Consts.h"
#include "Game.h"
#include "Loop.h"
#include "StringUtils.h"
#include "achievements/All.h"

Game::Game() {
    // Initialize all achievements
    this->achievements = initAchievements();

    // seed the RNG (one per Game)
    gen.seed(rd());
}
Game::~Game() {
    for (auto &achievement : this->achievements) {
        delete achievement;
    }
}

bool Game::isInitialized() { return state.players.size() > 0; }
bool Game::isPrivate() const { return state.private_session; }

std::string Game::hostName() const {
    if (state.players.size() < 1)
        return "unknown";
    if (state.players[0].name == nullptr)
        return "unknown";
    return *state.players[0].name;
}

int Game::totalRoll() {
    int total = 0;
    for (uint i = 0; i < DICE_COUNT; ++i)
        total += state.rolls[i];
    return total;
}

bool Game::isSplit() { return totalRoll() == 7; }

bool Game::isDoubles() {
    int roll1 = state.rolls[0];
    for (uint i = 1; i < DICE_COUNT; ++i) {
        if (state.rolls[i] != roll1)
            return false;
    }
    return true;
}

bool Game::hasPlayer(std::string &id) {
    for (const auto &player : state.players) {
        if (player.session == id) {
            return true;
        }
    }
    return false;
}

int Game::getPlayerId(const std::string &id) {
    for (uint i = 0; i < state.players.size(); ++i) {
        if (state.players[i].session == id) {
            return i;
        }
    }
    return -1;
}

json Game::addPlayer(const PerSocketData &data) {
    json result;
    if (state.players.size() >= MAX_PLAYERS) {
        return result;
    }
    auto &player = state.players.emplace_back();
    player.crowned = std::make_shared<bool>(false);
    player.win_count = 0;
    player.connected = true;
    player.session = data.session;
    if (isSignedIn(player)) {
        player.name = std::make_shared<std::string>(data.display_name);
        result["name"] = *player.name;
        result["user_id"] = player.session;
    }
    result["type"] = "join";
    result["id"] = state.players.size() - 1;

    // This is our first player joining
    if (state.players.size() == 1) {
        clearTurn();
        turn_token = data.session;
        state.turn_index = 0;
    }
    return result;
}

void Game::clearTurn() {
    // Clear roll states
    for (uint i = 0; i < DICE_COUNT; ++i) {
        state.used[i] = false;
    }
    state.rolled = false;
}

bool Game::allUsed() {
    for (uint i = 0; i < DICE_COUNT; ++i) {
        if (!state.used[i])
            return false;
    }
    return true;
}

void Game::advanceTurn() {
    clearTurn();
    if (state.players.size() == 1) {
        turn_token = state.players[0].session;
        state.turn_index = 0;
    } else {
        state.turn_index = (int)(state.turn_index + 1) % state.players.size();
        turn_token = state.players[state.turn_index].session;
    }
}

json Game::disconnectPlayer(std::string id) {
    json result;
    for (uint i = 0; i < state.players.size(); ++i) {
        if (state.players[i].session == id) {
            state.players[i].connected = false;
            result["type"] = "disconnect";
            result["id"] = i;
            break;
        }
    }
    return result;
}

bool Game::isPlayerConnected(std::string id) const {
    for (uint i = 0; i < state.players.size(); ++i) {
        if (state.players[i].session == id) {
            return state.players[i].connected;
        }
    }
    return false;
}

json Game::reconnectPlayer(std::string id, std::string old_id, const PerSocketData& data) {
    json result;
    bool has_old_id = (id != old_id);
    for (uint i = 0; i < state.players.size(); ++i) {
        if (has_old_id && state.players[i].session == old_id) {
            // Update our session to the new id
            state.players[i].session = id;
            if (isSignedIn(state.players[i])) {
                state.players[i].name = std::make_shared<std::string>(data.display_name);
                result["name"] = *state.players[i].name;
                result["user_id"] = state.players[i].session;
            }
        }
        if (state.players[i].session == id) {
            state.players[i].connected = true;
            result["type"] = "reconnect";
            result["id"] = i;
            break;
        }
    }
    return result;
}

int Game::connectedPlayerCount() {
    int count = 0;
    for (const auto &player : state.players) {
        if (player.connected)
            ++count;
    }
    return count;
}

#define ACTION(x)                 \
    {                             \
#x, std::mem_fn(&Game::x) \
    }

static const std::unordered_map<
    std::string, std::function<void(Game *, SendFunc, HandlerArgs, json &,
                                    const std::string &)>>
    action_map = {ACTION(chat), ACTION(leave), ACTION(kick),
                  ACTION(restart), ACTION(update_name), ACTION(roll),
                  ACTION(add), ACTION(sub), ACTION(add_nth),
                  ACTION(sub_nth), ACTION(refetch_player)};

#undef ACTION

void Game::processEvent(const API::ServerPlayer *player, SendFunc &broadcast, HandlerArgs *server, const json &data, const API::GameState &prev) {
    API::AchievementProgressUserId user_id({.id = player->session, .type = API::UserIdType::ANONYMOUS});

    if (isSignedIn(*player)) {
        user_id.type = API::UserIdType::USER;
    };
    for (auto achievement : this->achievements) {
        auto progress = achievement->processEvent(data, prev, state, player->session);
        if (progress <= 0) continue;
        API::AchievementProgress ap{
            .achievement_id = achievement->getAchievementID(),
            .progress = progress,
            .user_id = user_id,
            .user_index = this->getPlayerId(player->session)};
        server->reportStats2("achievement_progress", ap.toString(), [broadcast](auto s) {
            API::AchievementUnlock a;
            try {
                a.fromString(s);
                broadcast(a.toString());
                // TODO: this sucks, but im lazy
            } catch (std::exception &e) {
                // expected
            }
        });
    }
}

void Game::handleMessage(HANDLER_ARGS) {
    if (!data["type"].is_string())
        throw API::GameError({.error = "Type is not specified correctly"});
    // Copy a snapshot of the current game state
    API::GameState prev(state);
    const API::ServerPlayer *player = nullptr;
    player = &getPlayer(state, session);
    if (player == nullptr)
        throw API::GameError({.error = "unknown player"});
    auto action_type = data["type"].get<std::string>();
    auto it = action_map.find(action_type);
    if (it != action_map.end()) {
        it->second(this, broadcast, server, data, session);
    } else {
        throw API::GameError({.error = "Unknown action type"});
    }
    processEvent(player, broadcast, &server, data, prev);
    updated = std::chrono::system_clock::now();
}

void Game::chat(HANDLER_ARGS) {
    json res;
    if (!data["msg"].is_string())
        throw API::GameError({.error = "Message must be a string"});
    for (uint i = 0; i < state.players.size(); ++i) {
        if (state.players[i].session == session) {
            res["type"] = data["type"];
            auto msg = data["msg"].get<std::string>();
            std::string name;
            if (state.players[i].name)
                name = *state.players[i].name;
            if (name == "") {
                name = "User" + std::to_string(i + 1);
            }
            std::string fullMsg = name + ": " + msg;
            if (fullMsg.length() > MAX_CHAT_LEN) {
                fullMsg = trimString(fullMsg, MAX_CHAT_LEN, true);
            }
            state.chat_log.insert(state.chat_log.begin(), fullMsg);
            if (state.chat_log.size() > MAX_CHAT_LOG) {
                state.chat_log.pop_back();
            }
            res["msg"] = fullMsg;
            broadcast(res.dump());
            return;
        }
    }
};

void Game::leave(HANDLER_ARGS) {
    json res;
    res["type"] = "leave";
    for (uint i = 0; i < state.players.size(); ++i) {
        if (state.players[i].session == session) {
            res["id"] = i;
            if (turn_token == state.players[i].session) {
                advanceTurn();
                json turn;
                turn["type"] = "update_turn";
                turn["id"] = state.turn_index;
                broadcast(turn.dump());
            }
            state.players.erase(state.players.begin() + i);
            broadcast(res.dump());
            break;
        }
    }
}

void Game::kick(HANDLER_ARGS) {
    if (!data["id"].is_number())
        throw API::GameError({.error = "pass a number please"});
    uint id = data["id"].get<uint>();
    if (state.players.empty())
        throw API::GameError({.error = "uhhh this should never happen"});
    if (id >= state.players.size())
        throw API::GameError({.error = "out of bounds"});

    json res;
    res["type"] = "kick";
    res["id"] = id;
    if (turn_token == state.players[id].session) {
        advanceTurn();
        if (state.turn_index > id) {
            state.turn_index--;
        }
        json turn;
        turn["type"] = "update_turn";
        turn["id"] = state.turn_index;
        broadcast(turn.dump());
    } else if (state.turn_index > id) {
        state.turn_index--;
    }
    for (auto &achievement : achievements) {
        achievement->removePlayer(state.players[id].session);
    }
    state.players.erase(state.players.begin() + id);
    broadcast(res.dump());
}

void Game::restart(HANDLER_ARGS) {
    if (state.players.empty())
        throw API::GameError({.error = "uhhh this should never happen"});
    if (!state.victory)
        throw API::GameError({.error = "game still in progress"});

    json res;
    for (auto &player : state.players) {
        player.score = 0;
        player.doubles_count = 0;
        player.roll_count = 0;
        player.turn_count = 0;
    }
    state.victory = false;
    advanceTurn();
    res["type"] = "restart";
    res["id"] = state.turn_index;
    broadcast(res.dump());
}

void Game::update_name(HANDLER_ARGS) {
    if (!data["name"].is_string())
        throw API::GameError({.error = "name must be a string"});
    std::string name = data["name"].get<std::string>();
    for (uint i = 0; i < state.players.size(); ++i) {
        if (state.players[i].session == session) {
            if (isSignedIn(state.players[i])) {
                throw API::GameError({.error = "signed in players can't change names that way"});
            }
            state.players[i].name = std::make_shared<std::string>(name);
            json msg;
            msg["type"] = "update_name";
            if (state.players[i].name != nullptr) {
                msg["name"] = *state.players[i].name;
            }
            msg["id"] = i;
            broadcast(msg.dump());
            return;
        }
    }
}
void Game::guardUpdate(const std::string &session) {
    if (state.victory)
        throw API::GameError({.error = "game is over"});
    if (session != turn_token)
        throw API::GameError({.error = "not your turn"});
    if (!state.rolled)
        throw API::GameError({.error = "you need to roll first"});
}

void Game::roll(HANDLER_ARGS) {
    /* server.reportStats2("add_stats", "{}", [broadcast](auto s) { */
    /*     API::AchievementUnlock a{ */
    /*         .name = "you did it congrats"}; */
    /*     broadcast(a.toString()); */
    /* }); */
    if (state.victory)
        throw API::GameError({.error = "game is over"});
    if (session != turn_token)
        throw API::GameError({.error = "not your turn"});
    if (state.rolled)
        throw API::GameError({.error = "now's not the time for that"});
    if (state.players.size() <= 1)
        throw API::GameError({.error = "invite some friends first!"});
    json resp;
    resp["type"] = "roll";
    for (uint i = 0; i < DICE_COUNT; ++i) {
        state.rolls[i] = dis(gen);
        resp["rolls"].push_back(state.rolls[i]);
    }
    state.rolled = true;

    // Update statistics
    for (uint i = 0; i < state.players.size(); ++i) {
        if (state.players[i].session == turn_token) {
            state.players[i].roll_count++;
            if (isDoubles()) {

                state.players[i].doubles_count++;
            } else {
                state.players[i].turn_count++;
            }
        }
    }
    broadcast(resp.dump());
}

void Game::add(HANDLER_ARGS) {
    guardUpdate(session);
    if (isSplit())
        throw API::GameError({.error = "you must add invdividually"});
    json j = json(totalRoll());
    update(broadcast, server, j, session);
}

void Game::sub(HANDLER_ARGS) {
    guardUpdate(session);
    if (isSplit())
        throw API::GameError({.error = "you must add invdividually"});
    json j = json(-totalRoll());
    update(broadcast, server, j, session);
}

int Game::guardNth(const json &data) {
    if (!isSplit())
        throw API::GameError({.error = "This is not a split"});
    if (!data.is_number())
        throw API::GameError({.error = "NaN"});
    uint n = data.get<uint>();
    if (n >= DICE_COUNT)
        throw API::GameError({.error = "too high"});
    if (state.used[n])
        throw API::GameError({.error = "already spent"});
    state.used[n] = true;
    return n;
}

void Game::add_nth(HANDLER_ARGS) {
    guardUpdate(session);
    int n = guardNth(data["n"]);
    json j = json(state.rolls[n]);
    update(broadcast, server, j, session);
}

void Game::sub_nth(HANDLER_ARGS) {
    guardUpdate(session);
    int n = guardNth(data["n"]);
    json j = json(-state.rolls[n]);
    update(broadcast, server, j, session);
}

void Game::refetch_player(HANDLER_ARGS) {
    API::RefetchPlayer msg;
    msg.fromString(data.dump());
    broadcast(msg.toString());
}

void Game::update(HANDLER_ARGS) {
    int change = data.get<int>();
    json res;
    uint winnerId;
    for (winnerId = 0; winnerId < state.players.size(); ++winnerId) {
        if (state.players[winnerId].session == session)
            break;
    }
    int score = state.players[winnerId].score += change;
    res["type"] = "update";
    res["score"] = score;
    res["used"] = state.used;
    res["id"] = winnerId;
    broadcast(res.dump());
    if (!isSplit() || allUsed()) {
        if (!isDoubles()) {
            if (TARGET_SCORES.count(score)) {
                // WIN CONDITION
                json win;
                state.players[winnerId].win_count++;
                for (uint i = 0; i < state.players.size(); ++i) {
                    state.players[i].crowned = std::make_shared<bool>(false);
                    API::ReportStatsUserId user_id({.id = state.players[i].session, .type = API::UserIdType::ANONYMOUS});
                    if (isSignedIn(state.players[i])) {
                        user_id.type = API::UserIdType::USER;
                    }
                    API::ReportStats stats{
                        .doubles = state.players[i].doubles_count,
                        .games = 1,
                        .rolls = state.players[i].roll_count,
                        .user_id = user_id,
                        .wins = (winnerId == i ? 1 : 0)};
                    server.reportStats2("add_stats", stats.toString(), [broadcast](auto s) {
                        std::cout << "AUTH SAYS: " << s << std::endl;
                        /* API::Achievement_Unlock a{ */
                        /*     .name = "you did it congrats"}; */
                        /* broadcast(a.toString()); */
                    });
                }

                state.players[winnerId].crowned = std::make_shared<bool>(true);

                win["type"] = "win";
                win["id"] = winnerId;
                state.victory = true;
                broadcast(win.dump());
            } else {
                for (uint i = 0; i < state.players.size(); ++i) {
                    if (session == state.players[i].session) {
                        continue;
                    }
                    if (score == state.players[i].score) {
                        state.players[i].score = 0;
                        json update;
                        update["type"] = "update";
                        update["id"] = i;
                        update["score"] = 0;
                        update["reset"] = true;
                        broadcast(update.dump());
                        break;
                    }
                }
                advanceTurn();
                json turn;
                turn["type"] = "update_turn";
                turn["id"] = state.turn_index;
                broadcast(turn.dump());
            }
        } else {
            for (uint i = 0; i < state.players.size(); ++i) {
                if (session == state.players[i].session) {
                    continue;
                }
                if (score == state.players[i].score) {
                    state.players[i].score = 0;
                    json update;
                    update["type"] = "update";
                    update["id"] = i;
                    update["score"] = 0;
                    update["reset"] = true;
                    broadcast(update.dump());
                    break;
                }
            }
            clearTurn();
            json rollAgain;
            rollAgain["type"] = "roll_again";
            server.send(rollAgain.dump());
        }
    }
}
