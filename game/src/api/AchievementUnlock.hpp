//  To parse this JSON data, first install
//
//      json.hpp  https://github.com/nlohmann/json
//
//  Then include this file, and then do
//
//     AchievementUnlock.hpp data = nlohmann::json::parse(jsonString);

#pragma once

#include <optional>
#include "json.hpp"
#include "helper.hpp"

namespace API {
    enum class AchievementUnlockType : int;
}

namespace API {
    using nlohmann::json;

    struct AchievementUnlock {
        std::string description;
        std::string id;
        std::optional<std::string> image_url;
        int64_t max_progress;
        std::string name;
        AchievementUnlockType type;
        std::string user_id;
        int64_t user_index;
    };
}
