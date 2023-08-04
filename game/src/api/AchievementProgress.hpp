//  To parse this JSON data, first install
//
//      json.hpp  https://github.com/nlohmann/json
//
//  Then include this file, and then do
//
//     AchievementProgress.hpp data = nlohmann::json::parse(jsonString);

#pragma once

#include <optional>
#include "json.hpp"
#include "helper.hpp"

#include "UserId.hpp"

namespace API {
    enum class AchievementProgressType : int;
}

namespace API {
    using nlohmann::json;

    struct AchievementProgress {
        std::string achievement_id;
        int64_t progress;
        AchievementProgressType type;
        UserId user_id;
        int64_t user_index;
    };
}
