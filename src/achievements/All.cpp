#include "All.h"
#include "GettingStarted.h"

std::vector<BaseAchievement *> initAchievements() {
    std::vector<BaseAchievement *> achievements{
        new GettingStarted(),
    };
    return achievements;
}
