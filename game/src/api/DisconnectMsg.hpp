
#pragma once

#include <optional>

namespace API {
    enum class DisconnectMsgType : int;
}

namespace API {

    struct DisconnectMsg {
        int64_t id;
        DisconnectMsgType type = static_cast<DisconnectMsgType>(0);
    };
}
