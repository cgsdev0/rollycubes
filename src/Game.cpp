#include "Game.h"
#include <unordered_map>
#include "Consts.h"

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

typedef std::function<void(std::string)> SendFunc;

const auto actionHandler = [](auto send, auto broadcast, auto data,
                              auto session) { send("holy shit it works"); };
const std::unordered_map<
    std::string,
    std::function<void(SendFunc&, SendFunc&, json&, const std::string&)>>
    action_map = {{"ACTION", actionHandler}};

void Game::handleMessage(SendFunc send, SendFunc broadcast, json& data,
                         const std::string& session) {
    if (!data["type"].is_string())
        throw GameError("Type is not specified correctly");
    auto action_type = data["type"].get<std::string>();
    auto it = action_map.find(action_type);
    if (it != action_map.end()) {
        it->second(send, broadcast, data, session);
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
