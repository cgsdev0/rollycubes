
#pragma once


namespace API {
    enum class UserIdType : int;
}

namespace API {

    struct AchievementProgressUserId {
std::string toString() const;
void fromString(const std::string &str);
        std::string id;
        UserIdType type;
    };
}
