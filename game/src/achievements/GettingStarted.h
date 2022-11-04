#ifndef INCLUDE_ACHIEVEMENTS_GETTING_STARTED_H
#define INCLUDE_ACHIEVEMENTS_GETTING_STARTED_H

#include "BaseAchievement.h"

class GettingStarted : public BaseAchievement {

    virtual int processEvent(const json &event, const API::GameState &before, const API::GameState &after, const std::string &session) {
        if (event["type"] == "roll" &&
            getPlayer(before, session).roll_count == 0) {
            return 1;
        }
        return 0;
    }
    // Get the achievement ID
    virtual std::string getAchievementID() {
        return "getting_started";
    }
};

#endif
