
#ifndef INCLUDE_ACHIEVEMENTS_ASTRONAUT_H
#define INCLUDE_ACHIEVEMENTS_ASTRONAUT_H

#include "BaseAchievement.h"

class Astronaut : public BaseAchievement {
  public:
    virtual int processEvent(const json &event, const API::GameState &before, const API::GameState &after, const std::string &session) {
        if (!before.victory && after.victory && getPlayer(after, session).score == 100) {
            return 1;
        }
        return 0;
    }
    // Get the achievement ID
    virtual std::string getAchievementID() {
        return "astronaut:1";
    }
};

#endif
