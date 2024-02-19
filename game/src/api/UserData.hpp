
#pragma once

#include <optional>
#include <variant>

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
        std::optional<std::vector<Achievement>> achievements;
        Color color;
        std::string created_date;
        Dice dice;
        bool donor;
        std::string id;
        std::optional<std::string> image_url;
        std::optional<std::string> pubkey_text;
        std::optional<UserStats> stats;
        std::string username;
    };
}
