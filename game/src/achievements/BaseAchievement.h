#ifndef INCLUDE_ACHIEVEMENTS_BASE_H
#define INCLUDE_ACHIEVEMENTS_BASE_H

#include "../Consts.h"
#include "../api/API.hpp"
#include <json.hpp>
#include <string>

using json = nlohmann::json;

inline const API::ServerPlayer &getPlayer(const API::GameState &state, const std::string &session) {
    for (const auto &player : state.players) {
        if (player.session == session) {
            return player;
        }
    }
    throw API::GameError({.error = "unknown player"});
}

class BaseAchievement {
  public:
    virtual void removePlayer(const std::string &session) {}
    // Return the progress on this achievement
    virtual int processEvent(const json &event, const API::GameState &before, const API::GameState &after, const std::string &session) = 0;
    // Get the achievement ID
    virtual std::string getAchievementID() = 0;

    virtual ~BaseAchievement() {}
};

#endif
