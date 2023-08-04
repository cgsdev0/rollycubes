
#pragma once

#include <optional>

namespace API {
    enum class ReconnectMsgType : int;
}

namespace API {

    struct ReconnectMsg {
        int64_t id;
        std::optional<std::string> name;
        ReconnectMsgType type;
        std::optional<std::string> user_id;
    };
}
