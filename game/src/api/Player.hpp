//  To parse this JSON data, first install
//
//      json.hpp  https://github.com/nlohmann/json
//
//  Then include this file, and then do
//
//     Player.hpp data = nlohmann::json::parse(jsonString);

#pragma once

#include <optional>
#include "json.hpp"
#include "helper.hpp"

namespace API {
    using nlohmann::json;

    struct Player {
        bool connected;
        std::optional<bool> crowned;
        std::optional<std::string> name;
        int64_t score;
        int64_t skip_count;
        std::optional<std::string> user_id;
        int64_t win_count;
    };
}
