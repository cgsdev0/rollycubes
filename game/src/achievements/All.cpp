#include "All.h"
#include "Doubles.h"
#include "GettingStarted.h"
#include "Negative.h"
#include "WinGames.h"

std::vector<BaseAchievement *> initAchievements() {
    std::vector<BaseAchievement *> achievements{
        new GettingStarted(),
        new WinGames("1"),
        new WinGames("2"),
        new WinGames("3"),
        new Doubles(1),
        new Doubles(2),
        new Doubles(3),
        new Negative(),
    };
    return achievements;
}
