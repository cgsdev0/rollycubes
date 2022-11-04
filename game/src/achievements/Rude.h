#ifndef INCLUDE_ACHIEVEMENTS_RUDE_H
#define INCLUDE_ACHIEVEMENTS_RUDE_H

#include "../Consts.h"
#include "BaseAchievement.h"

// example:
// Player 1: 29
// Player 2: 25
//
// Player 1 rolls a 1 and 3, and click subtract
// result: true

// example:
// Player 1: 29
// Player 2: 25
//
// Player 1 rolls a 2 and 2, and click subtract
// result: false

// example:
// Player 1: 32
// Player 2: 25
//
// Player 1 rolls a 3 and 4, and subtracts both
// result: true

class Rude : public BaseAchievement {
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
        // Save state for the first half of a split roll
        if (event["type"] == "add_nth" || event["type"] == "sub_nth") {
            if (!before.used[0] && !before.used[1]) {
                this->originalScore = getPlayer(before, session).score;
                return 0;
            }
        }
        if (event["type"] != "add" &&
            event["type"] != "sub" &&
            event["type"] != "add_nth" &&
            event["type"] != "sub_nth") return 0;
        if (isDoubles(before)) return 0;
        bool reset = false;

        for (unsigned int i = 0; i < before.players.size(); ++i) {
            if (after.players[i].score == 0 && before.players[i].score != 0) {
                reset = true;
                break;
            }
        }
        if (!reset) return 0;

        auto score = getPlayer(before, session).score;
        auto roll = before.rolls[0] + before.rolls[1];
        if (event["type"] == "add") {
            return TARGET_SCORES.count(score - roll) > 0;
        } else if (event["type"] == "sub") {
            return TARGET_SCORES.count(score + roll) > 0;
        } else {
            // handle 7s
            auto diff = before.rolls[0] - before.rolls[1];
            unsigned int c = 0;
            c += TARGET_SCORES.count(originalScore + roll);
            c += TARGET_SCORES.count(originalScore - roll);
            c += TARGET_SCORES.count(originalScore + diff);
            c += TARGET_SCORES.count(originalScore - diff);
            return c > 0;
        }
        return 0;
    }
    // Get the achievement ID
    virtual std::string getAchievementID() {
        return "rude";
    }

  private:
    int originalScore = 0;
};

#endif
