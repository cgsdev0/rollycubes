
#pragma once

#include <optional>
#include <variant>

namespace API {
    enum class UserIdType : int;
}

namespace API {

    struct UserId {
std::string toString() const;
void fromString(const std::string &str);
        std::string id;
        UserIdType type = static_cast<UserIdType>(0);
    };
}
