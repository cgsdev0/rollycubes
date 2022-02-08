#ifndef INCLUDE_ACHIEVEMENTS_BASE_H
#define INCLUDE_ACHIEVEMENTS_BASE_H

#include "../API.h"
#include <json.hpp>
#include <string>

using json = nlohmann::json;

class BaseAchievement {
  public:
    // Return the progress on this achievement
    virtual int processEvent(const json &event, const API::GameState &before, const API::GameState &after, const std::string &session) = 0;
    // Get the achievement ID
    virtual std::string getAchievementID() = 0;

    virtual ~BaseAchievement() {}
};

#endif
