
#pragma once

#include <optional>

namespace API {
    enum class ReconnectMsgType : int;
}

namespace API {

    struct ReconnectMsg {
        int64_t id;
        std::optional<std::string> name;
        ReconnectMsgType type = static_cast<ReconnectMsgType>(0);
        std::optional<std::string> user_id;
    };
}
