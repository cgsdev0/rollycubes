
#pragma once

#include <optional>

namespace API {
    enum class RollAgainMsgType : int;
}

namespace API {

    struct RollAgainMsg {
        RollAgainMsgType type = static_cast<RollAgainMsgType>(0);
    };
}
