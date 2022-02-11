
#ifndef INCLUDE_ACHIEVEMENTS_DOUBLES_H
#define INCLUDE_ACHIEVEMENTS_DOUBLES_H

#include "BaseAchievement.h"
#include <map>

class Doubles : public BaseAchievement {
  public:
    Doubles(int id) {
        this->id = id;
    }

    virtual void removePlayer(const std::string &session) {
        streaks.erase(session);
    }

    bool isDoubles(const API::GameState &state) {
        int roll1 = state.rolls[0];
        for (uint i = 1; i < DICE_COUNT; ++i) {
            if (state.rolls[i] != roll1)
                return false;
        }
        return true;
    }

    virtual int processEvent(const json &event, const API::GameState &before, const API::GameState &after, const std::string &session) {
        if (event["type"] == "roll") {
            if (isDoubles(after)) {
                auto it = streaks.find(session);
                if (it == streaks.end()) {
                    streaks[session] = 0;
                }
                streaks[session]++;
                // doubles:1 is 3x, doubles:2 is 5x, etc
                if (streaks[session] == id * 2 + 1) {
                    return 1;
                }
            } else {
                // Reset streak
                streaks[session] = 0;
            }
        }
        return 0;
    }
    // Get the achievement ID
    virtual std::string getAchievementID() {
        return "doubles:" + std::to_string(id);
    }

  private:
    std::map<std::string, int> streaks;
    int id;
};

#endif
