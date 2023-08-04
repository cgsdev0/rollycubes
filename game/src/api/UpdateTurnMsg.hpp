
#pragma once

#include <optional>

namespace API {
    enum class UpdateTurnMsgType : int;
}

namespace API {

    struct UpdateTurnMsg {
        int64_t id;
        std::optional<bool> skip;
        UpdateTurnMsgType type;
    };
}
