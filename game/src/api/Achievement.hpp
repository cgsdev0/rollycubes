
#pragma once


#include "AchievementClass.hpp"

namespace API {

    struct Achievement {
        AchievementClass achievement;
        double progress;
        std::string unlocked;
    };
}
