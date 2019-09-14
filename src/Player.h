#pragma once
#include <string>

#include "Consts.h"

class Player {
   public:
    Player();

   private:
    std::string session;
    std::string name;
    int score;
    int win_count;
    bool connected;
};
