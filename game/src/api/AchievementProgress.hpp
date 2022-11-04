
#pragma once


namespace API {
    enum class AchievementProgressType : int;
}

namespace API {

    struct AchievementProgress {
std::string toString() const;
void fromString(const std::string &str);
        std::string achievement_id;
        double progress;
        AchievementProgressType type = static_cast<AchievementProgressType>(0);
        std::string user_id;
    };
}
