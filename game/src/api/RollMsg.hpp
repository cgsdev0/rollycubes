
#pragma once

#include <optional>

namespace API {
    enum class RollMsgType : int;
}

namespace API {

    struct RollMsg {
        std::vector<double> rolls;
        RollMsgType type;
    };
}
