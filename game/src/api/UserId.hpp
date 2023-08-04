
#pragma once

#include <optional>

namespace API {
    enum class UserIdType : int;
}

namespace API {

    struct UserId {
        std::string id;
        UserIdType type = static_cast<UserIdType>(0);
    };
}
