//  To parse this JSON data, first install
//
//      json.hpp  https://github.com/nlohmann/json
//
//  Then include this file, and then do
//
//     UserData.hpp data = nlohmann::json::parse(jsonString);

#pragma once

#include <optional>
#include "json.hpp"
#include "helper.hpp"

#include "Color.hpp"
#include "Dice.hpp"

namespace API {
    struct Achievement;
    struct UserStats;
}

namespace API {
    using nlohmann::json;

    struct UserData {
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
