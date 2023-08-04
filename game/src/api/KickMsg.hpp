
#pragma once

#include <optional>

namespace API {
    enum class KickMsgType : int;
}

namespace API {

    struct KickMsg {
        int64_t id;
        KickMsgType type = static_cast<KickMsgType>(0);
    };
}
