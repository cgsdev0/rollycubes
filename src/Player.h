#pragma once
#include <string>

#include "Consts.h"

class Player {
   public:
    Player();

    Player(std::string session);

    const std::string& getSession() const;

    void disconnect();

    bool isConnected() const;

   private:
    std::string session;
    std::string name;
    int score;
    int win_count;
    bool connected;
};
