//  To parse this JSON data, first install
//
//      json.hpp  https://github.com/nlohmann/json
//
//  Then include this file, and then do
//
//     ServerPlayer.hpp data = nlohmann::json::parse(jsonString);

#pragma once

#include <optional>
#include "json.hpp"
#include "helper.hpp"

namespace API {
    using nlohmann::json;

    struct ServerPlayer {
        bool connected;
        std::optional<bool> crowned;
        int64_t doubles_count;
        std::optional<std::string> name;
        int64_t roll_count;
        int64_t score;
        std::string session;
        int64_t skip_count;
        int64_t turn_count;
        std::optional<std::string> user_id;
        int64_t win_count;
    };
}
