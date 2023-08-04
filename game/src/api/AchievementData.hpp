
#pragma once

#include <optional>

namespace API {

    struct AchievementData {
        std::string description;
        std::string id;
        std::optional<std::string> image_url;
        int64_t max_progress;
        std::string name;
    };
}
