
#pragma once

#include <optional>

namespace API {
    enum class UpdateNameMsgType : int;
}

namespace API {

    struct UpdateNameMsg {
        int64_t id;
        std::string name;
        UpdateNameMsgType type;
    };
}
