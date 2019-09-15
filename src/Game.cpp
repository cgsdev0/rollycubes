#include "Game.h"
#include "Consts.h"

bool Game::isInitialized() { return player_count > 0; }
bool Game::hasPlayer(std::string id) {
    for (unsigned int i = 0; i < player_count; ++i) {
        if (players[i].getSession() == id) {
            return true;
        }
    }
    return false;
}
bool Game::addPlayer(std::string id) {
    if (player_count >= MAX_PLAYERS) {
        return false;
    }
    new (&players[player_count++]) Player(id);
    return true;
}

bool Game::disconnectPlayer(std::string id) {
    for (unsigned int i = 0; i < player_count; ++i) {
        if (players[i].getSession() == id) {
            players[i].disconnect();
            return true;
        }
    }
    return false;
}

int Game::connectedPlayerCount() {
    int count = 0;
    for (unsigned int i = 0; i < player_count; ++i) {
        if (players[i].isConnected()) ++count;
    }
    return count;
}
