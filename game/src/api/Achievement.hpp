
#pragma once


#include "AchievementClass.hpp"

namespace API {

    struct Achievement {
std::string toString() const;
void fromString(const std::string &str);
        AchievementClass achievement;
        double progress;
        std::string unlocked;
    };
}
