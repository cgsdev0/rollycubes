

#ifndef INCLUDE_ACHIEVEMENTS_NEGATIVE_H
#define INCLUDE_ACHIEVEMENTS_NEGATIVE_H

#include "BaseAchievement.h"

class Negative : public BaseAchievement {
  public:
    virtual int processEvent(const json &event, const API::GameState &before, const API::GameState &after, const std::string &session) {
        try {
            auto beforePlayer = getPlayer(before, session);
            auto afterPlayer = getPlayer(after, session);
            if (beforePlayer.score >= 0 && afterPlayer.score < 0) {
                return 1;
            }
        } catch (const std::exception &e) {
            return 0;
        }
        return 0;
    }
    // Get the achievement ID
    virtual std::string getAchievementID() {
        return "negative";
    }
};

#endif
