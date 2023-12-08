
#pragma once

#include <optional>
#include <variant>

#include "UserId.hpp"

namespace API {
    enum class AchievementProgressType : int;
}

namespace API {

    struct AchievementProgress {
std::string toString() const;
void fromString(const std::string &str);
        std::string achievement_id;
        int64_t progress;
        AchievementProgressType type = static_cast<AchievementProgressType>(0);
        UserId user_id;
        int64_t user_index;
    };
}
