#pragma once

#include "Consts.h"
#include "Player.h"

class Game {
   public:
    Game() : turn_index(0), player_count(0) {}

    bool isInitialized();

    bool hasPlayer(std::string id);
    bool addPlayer(std::string id);

    bool disconnectPlayer(std::string id);

    int connectedPlayerCount();

   private:
    Player players[MAX_PLAYERS];
    int player_count;
    int turn_index;
    int roll[DICE_COUNT];
    bool used[DICE_COUNT];
    bool initialized;
};
