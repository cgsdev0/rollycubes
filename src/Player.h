#pragma once
#include <json.hpp>
#include <string>

#include "Consts.h"

using json = nlohmann::json;

class Player {
   public:
    Player();

    Player(std::string session);

    const std::string& getSession() const;

    void disconnect();
    void reconnect();

    bool isConnected() const;

    int addScore(int n);

    int getScore();

    int addWin(int n);

    void reset();

    void setName(std::string& name);

    const std::string& getName();

    json toJson() const;

   private:
    std::string session;
    std::string name;
    int score;
    int win_count;
    bool connected;
};
