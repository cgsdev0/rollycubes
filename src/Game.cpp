#include <iostream>
#include <unordered_map>

#include "Consts.h"
#include "Game.h"

bool Game::isInitialized() { return players.size() > 0; }

int Game::totalRoll() {
    int total = 0;
    for (int i = 0; i < DICE_COUNT; ++i) total += rolls[i];
    return total;
}

bool Game::isSplit() { return this->totalRoll() == 7; }

bool Game::isDoubles() {
    int roll1 = rolls[0];
    for (int i = 1; i < DICE_COUNT; ++i) {
        if (rolls[i] != roll1) return false;
    }
    return true;
}

bool Game::hasPlayer(std::string id) {
    for (const auto& player : players) {
        if (player.getSession() == id) {
            return true;
        }
    }
    return false;
}

json Game::addPlayer(std::string id) {
    json result;
    if (players.size() >= MAX_PLAYERS) {
        return result;
    }
    players.emplace_back(id);
    result["type"] = "join";
    result["id"] = players.size() - 1;
    // This is our first player joining
    if (players.size() == 1) {
        this->clearTurn();
        this->turn_token = id;
        this->turn_index = 0;
    }
    return result;
}

json Game::toJson() {
    json result;
    for (const auto& player : players) {
        result["players"].push_back(player.toJson());
    }
    for (int i = 0; i < DICE_COUNT; ++i) {
        result["rolls"].push_back(rolls[i]);
        result["used"].push_back(used[i]);
    }
    result["turn_index"] = turn_index;
    result["victory"] = victory;
    result["rolled"] = rolled;
    return result;
}

void Game::clearTurn() {
    // Clear roll states
    for (int i = 0; i < DICE_COUNT; ++i) {
        used[i] = false;
    }
    rolled = false;
}

bool Game::allUsed() {
    for (int i = 0; i < DICE_COUNT; ++i) {
        if (!used[i]) return false;
    }
    return true;
}

void Game::advanceTurn() {
    this->clearTurn();
    if (players.size() == 1) {
        turn_token = players[0].getSession();
        turn_index = 0;
    } else {
        turn_index = (turn_index + 1) % players.size();
        turn_token = players[turn_index].getSession();
    }
}

json Game::disconnectPlayer(std::string id) {
    json result;
    for (int i = 0; i < players.size(); ++i) {
        if (players[i].getSession() == id) {
            players[i].disconnect();
            result["type"] = "disconnect";
            result["id"] = i;
            break;
        }
    }
    return result;
}

json Game::reconnectPlayer(std::string id) {
    json result;
    for (int i = 0; i < players.size(); ++i) {
        if (players[i].getSession() == id) {
            players[i].disconnect();
            result["type"] = "reconnect";
            result["id"] = i;
            break;
        }
    }
    return result;
}

int Game::connectedPlayerCount() {
    int count = 0;
    for (const auto& player : players) {
        if (player.isConnected()) ++count;
    }
    return count;
}

#define ACTION(x) \
    { #x, std::mem_fn(&Game::x) }

static const std::unordered_map<
    std::string,
    std::function<void(Game*, SendFunc, SendFunc, json&, const std::string&)>>
    action_map = {ACTION(chat),    ACTION(leave),       ACTION(kick),
                  ACTION(restart), ACTION(update_name), ACTION(roll),
                  ACTION(add),     ACTION(sub),         ACTION(add_nth),
                  ACTION(sub_nth)};

#undef ACTION

void Game::handleMessage(HANDLER_ARGS) {
    if (!data["type"].is_string())
        throw GameError("Type is not specified correctly");
    auto action_type = data["type"].get<std::string>();
    auto it = action_map.find(action_type);
    if (it != action_map.end()) {
        it->second(this, send, broadcast, data, session);
    } else {
        throw GameError("Unknown action type");
    }
}

void Game::chat(HANDLER_ARGS) {
    json res;
    if (!data["msg"].is_string()) throw GameError("Message must be a string");
    res["type"] = data["type"];
    res["msg"] = data["msg"];
    std::cout << res["msg"] << std::endl;
    broadcast(res.dump());
};

void Game::leave(HANDLER_ARGS) {
    json res;
    res["type"] = "leave";
    for (int i = 0; i < players.size(); ++i) {
        if (players[i].getSession() == session) {
            res["id"] = i;
            if (turn_token == players[i].getSession()) {
                this->advanceTurn();
                json turn;
                turn["type"] = "update_turn";
                turn["id"] = turn_index;
                broadcast(res.dump());
            }
            players.erase(players.begin() + i);
            broadcast(res.dump());
            break;
        }
    }
}

void Game::kick(HANDLER_ARGS) {
    if (!data["id"].is_number()) throw GameError("pass a number please");
    int id = data["id"].get<int>();
    if (players.empty()) throw GameError("uhhh this should never happen");
    if (players[0].getSession() != session) throw GameError("You are not host");
    if (id == 0) throw GameError("why are you kicking yourself");
    if (id >= players.size()) throw GameError("out of bounds");

    json res;
    res["type"] = "kick";
    res["id"] = id;
    if (turn_token == players[id].getSession()) {
        this->advanceTurn();
        json turn;
        turn["type"] = "update_turn";
        turn["id"] = turn_index;
        broadcast(res.dump());
    }
    players.erase(players.begin() + id);
    broadcast(res.dump());
}

void Game::restart(HANDLER_ARGS) {
    if (players.empty()) throw GameError("uhhh this should never happen");
    if (players[0].getSession() != session) throw GameError("You are not host");
    if (!victory) throw GameError("game still in progress");

    json res;
    for (auto& player : players) player.reset();
    advanceTurn();
    res["type"] = "restart";
    res["id"] = this->turn_index;
    broadcast(res.dump());
}

void Game::update_name(HANDLER_ARGS) {
    if (!data["name"].is_string()) throw GameError("name must be a string");
    std::string name = data["name"].get<std::string>();
    for (int i = 0; i < players.size(); ++i) {
        if (players[i].getSession() == session) {
            players[i].setName(name);
            json msg;
            msg["type"] = "update_name";
            msg["name"] = players[i].getName();
            msg["id"] = i;
            broadcast(msg.dump());
            return;
        }
    }
}
void Game::guardUpdate(const std::string& session) {
    if (session != this->turn_token) throw GameError("not your turn");
    if (!rolled) throw GameError("you need to roll first");
}

void Game::roll(HANDLER_ARGS) {
    if (session != this->turn_token) throw GameError("not your turn");
    if (rolled) throw GameError("now's not the time for that");
    if (players.size() <= 1) throw GameError("invite some friends first!");
    for (int i = 0; i < DICE_COUNT; ++i) {
        rolls[i] = dis(gen);
    }
}

void Game::add(HANDLER_ARGS) {
    this->guardUpdate(session);
    if (this->isSplit()) throw GameError("you must add invdividually");
    data = this->totalRoll();
    this->update(send, broadcast, data, session);
}

void Game::sub(HANDLER_ARGS) {
    this->guardUpdate(session);
    if (this->isSplit()) throw GameError("you must add invdividually");
    data = -this->totalRoll();
    this->update(send, broadcast, data, session);
}

int Game::guardNth(const json& data) {
    if (!this->isSplit()) throw GameError("This is not a split");
    if (!data.is_number()) throw GameError("NaN");
    int n = data.get<int>();
    if (n >= DICE_COUNT) throw GameError("too high");
    if (used[n]) throw GameError("already spent");
    used[n] = true;
    return n;
}

void Game::add_nth(HANDLER_ARGS) {
    this->guardUpdate(session);
    int n = this->guardNth(data["n"]);
    data = rolls[n];
    this->update(send, broadcast, data, session);
}

void Game::sub_nth(HANDLER_ARGS) {
    this->guardUpdate(session);
    int n = this->guardNth(data["n"]);
    data = -rolls[n];
    this->update(send, broadcast, data, session);
}

void Game::update(HANDLER_ARGS) {
    int change = data.get<int>();
    json res;
    int i;
    for (i = 0; i < players.size(); ++i) {
        if (players[i].getSession() == session) break;
    }
    int score = players[i].addScore(change);
    res["type"] = "update";
    res["score"] = score;
    res["id"] = i;
    broadcast(res.dump());
    if (!this->isSplit() || this->allUsed()) {
        if (!this->isDoubles()) {
            if (TARGET_SCORES.count(score)) {
                // WIN CONDITION
                players[i].addWin(1);
                res["type"] = "win";
                res["id"] = i;
                victory = true;
            } else {
                this->advanceTurn();
                json turn;
                turn["type"] = "update_turn";
                turn["id"] = turn_index;
                broadcast(res.dump());
            }
        } else {
            clearTurn();
            json rollAgain;
            rollAgain["type"] = "roll_again";
            send(rollAgain.dump());
        }
    }
}
