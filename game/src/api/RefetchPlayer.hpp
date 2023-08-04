
#pragma once

#include <optional>

namespace API {
    enum class RefetchPlayerType : int;
}

namespace API {

    struct RefetchPlayer {
std::string toString() const;
void fromString(const std::string &str);
        RefetchPlayerType type = static_cast<RefetchPlayerType>(0);
        std::string user_id;
    };
}
