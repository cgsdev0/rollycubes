
#pragma once

#include <optional>

namespace API {
    enum class AchievementUnlockType : int;
}

namespace API {

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
