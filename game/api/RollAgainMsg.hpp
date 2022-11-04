
#pragma once


namespace API {
    enum class RollAgainMsgType : int;
}

namespace API {

    struct RollAgainMsg {
        RollAgainMsgType type = 0;
    };
}
