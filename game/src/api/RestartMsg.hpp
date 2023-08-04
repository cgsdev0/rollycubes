
#pragma once

#include <optional>

namespace API {
    enum class RestartMsgType : int;
}

namespace API {

    struct RestartMsg {
        int64_t id;
        RestartMsgType type;
    };
}
