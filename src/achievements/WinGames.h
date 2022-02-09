
#ifndef INCLUDE_ACHIEVEMENTS_WIN_GAMES_H
#define INCLUDE_ACHIEVEMENTS_WIN_GAMES_H

#include "BaseAchievement.h"

class WinGames : public BaseAchievement {
  public:
    WinGames(std::string id) {
        this->id = id;
    }

    virtual int processEvent(const json &event, const API::GameState &before, const API::GameState &after, const std::string &session) {
        if (!before.victory && after.victory) {
            return 1;
        }
        return 0;
    }
    // Get the achievement ID
    virtual std::string getAchievementID() {
        return "win_games:" + id;
    }

  private:
    std::string id;
};

#endif
