#include <iostream>
#include <unordered_map>

#include "Consts.h"
#include "Game.h"

bool Game::isInitialized() { return players.size() > 0; }

bool Game::hasPlayer(std::string id) {
    for (const auto& player : players) {
        if (player.getSession() == id) {
            return true;
        }
    }
    return false;
}

bool Game::addPlayer(std::string id) {
    if (players.size() >= MAX_PLAYERS) {
        return false;
    }
    players.emplace_back(id);
    return true;
}

bool Game::disconnectPlayer(std::string id) {
    for (auto& player : players) {
        if (player.getSession() == id) {
            player.disconnect();
            return true;
        }
    }
    return false;
}

void Game::chat(HANDLER_ARGS) {
    json res;
    if (!data["msg"].is_string()) throw GameError("Message must be a string");
    res["type"] = data["type"];
    res["msg"] = data["msg"];
    std::cout << res["msg"] << std::endl;
    broadcast(res.dump());
};

const std::unordered_map<
    std::string,
    std::function<void(Game*, SendFunc, SendFunc, json&, const std::string&)>>
    action_map = {{"CHAT", std::mem_fn(&Game::chat)}};

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

int Game::connectedPlayerCount() {
    int count = 0;
    for (const auto& player : players) {
        if (player.isConnected()) ++count;
    }
    return count;
}
