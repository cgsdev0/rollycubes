
#pragma once

#include <optional>

namespace API {
    enum class RefetchPlayerType : int;
}

namespace API {

    struct RefetchPlayer {
        RefetchPlayerType type = static_cast<RefetchPlayerType>(0);
        std::string user_id;
    };
}
