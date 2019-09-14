#pragma once

#include "Consts.h"
#include "Player.h"

class Game {
   public:
    Game() : turn_index(0), player_count(0) {}

    bool isInitialized();

   private:
    Player players[MAX_PLAYERS];
    int player_count;
    int turn_index;
    int roll[DICE_COUNT];
    bool used[DICE_COUNT];
    bool initialized;
};
