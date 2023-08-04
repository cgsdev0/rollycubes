
#pragma once

#include <optional>

namespace API {
    enum class RefetchPlayerType : int;
}

namespace API {

    struct RefetchPlayer {
        RefetchPlayerType type;
        std::string user_id;
    };
}
