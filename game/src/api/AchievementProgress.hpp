
#pragma once

#include <optional>

#include "UserId.hpp"

namespace API {
    enum class AchievementProgressType : int;
}

namespace API {

    struct AchievementProgress {
        std::string achievement_id;
        int64_t progress;
        AchievementProgressType type = static_cast<AchievementProgressType>(0);
        UserId user_id;
        int64_t user_index;
    };
}
