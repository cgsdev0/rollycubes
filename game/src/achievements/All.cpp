#include "All.h"
#include "Astronaut.h"
#include "Doubles.h"
#include "GettingStarted.h"
#include "Negative.h"
#include "Oops.h"
#include "Perfect.h"
#include "Rude.h"
#include "WinGames.h"
#include "Thief.h"

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
        new Rude(),
        new Oops(),
        new Perfect(),
        new Astronaut(),
        new Thief(),
    };
    return achievements;
}
