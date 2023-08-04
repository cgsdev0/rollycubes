
#pragma once

#include <optional>

namespace API {
    enum class WinMsgType : int;
}

namespace API {

    struct WinMsg {
        int64_t id;
        WinMsgType type;
    };
}
