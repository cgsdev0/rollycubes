
#pragma once

#include <optional>

namespace API {

    struct AchievementData {
std::string toString() const;
void fromString(const std::string &str);
        std::string description;
        std::string id;
        std::optional<std::string> image_url;
        int64_t max_progress;
        std::string name;
    };
}
