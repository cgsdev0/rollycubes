
#pragma once


namespace API {
    enum class AchievementUnlockType : int;
}

namespace API {

    struct AchievementUnlock {
std::string toString() const;
void fromString(const std::string &str);
        std::string description;
        std::string id;
        std::shared_ptr<std::string> image_url;
        std::shared_ptr<double> max_progress;
        std::string name;
        AchievementUnlockType type = static_cast<AchievementUnlockType>(0);
    };
}
