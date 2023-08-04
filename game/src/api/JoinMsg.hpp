
#pragma once

#include <optional>

namespace API {
    enum class JoinMsgType : int;
}

namespace API {

    struct JoinMsg {
        int64_t id;
        std::optional<std::string> name;
        JoinMsgType type;
        std::optional<std::string> user_id;
    };
}
