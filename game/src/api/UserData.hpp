
#pragma once


#include "Color.hpp"
#include "Dice.hpp"

namespace API {
    struct Achievement;
    struct UserStats;
}

namespace API {

    struct UserData {
std::string toString() const;
void fromString(const std::string &str);
        std::shared_ptr<std::vector<Achievement>> achievements;
        Color color;
        std::string created_date;
        Dice dice;
        bool donor;
        std::string id;
        std::shared_ptr<std::string> image_url;
        std::shared_ptr<std::string> pubkey_text;
        std::shared_ptr<UserStats> stats;
        std::string username;
    };
}
