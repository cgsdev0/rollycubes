
#pragma once

#include <optional>

namespace API {
    enum class SpectatorsMsgType : int;
}

namespace API {

    struct SpectatorsMsg {
        int64_t count;
        SpectatorsMsgType type = static_cast<SpectatorsMsgType>(0);
    };
}
