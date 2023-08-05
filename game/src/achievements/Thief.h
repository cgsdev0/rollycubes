#ifndef INCLUDE_ACHIEVEMENTS_THIEF_H
#define INCLUDE_ACHIEVEMENTS_THIEF_H

#include "../Consts.h"
#include "BaseAchievement.h"

class Thief : public BaseAchievement {
  public:
    bool isDoubles(const API::GameState &state) {
        int roll1 = state.rolls[0];
        for (uint i = 1; i < DICE_COUNT; ++i) {
            if (state.rolls[i] != roll1)
                return false;
        }
        return true;
    }
    virtual int processEvent(const json &event, const API::GameState &before, const API::GameState &after, const std::string &session) {
      // Wait until the 2nd add / sub
        if (event["type"] == "add_nth" || event["type"] == "sub_nth") {
            if (!before.used[0] && !before.used[1]) {
                return 0;
            }
        }
        if (event["type"] != "add" &&
            event["type"] != "sub" &&
            event["type"] != "add_nth" &&
            event["type"] != "sub_nth") return 0;
        if (isDoubles(before)) return 0;

        auto score = before.players[(before.turn_index + 1) % before.players.size()].score;
        auto roll = before.rolls[0] + before.rolls[1];
        unsigned int c = 0;
        c += TARGET_SCORES.count(score - roll);
        c += TARGET_SCORES.count(score + roll);

        if (roll == 7) {
            // handle 7s
            auto diff = before.rolls[0] - before.rolls[1];
            c += TARGET_SCORES.count(score + diff);
            c += TARGET_SCORES.count(score - diff);
        }
        return c > 0;
    }
    // Get the achievement ID
    virtual std::string getAchievementID() {
        return "thief";
    }
};

#endif
