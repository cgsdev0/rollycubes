
#pragma once

#include <optional>

namespace API {
    enum class RollAgainMsgType : int;
}

namespace API {

    struct RollAgainMsg {
        RollAgainMsgType type;
    };
}
