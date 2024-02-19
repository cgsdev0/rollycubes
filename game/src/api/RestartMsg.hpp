
#pragma once

#include <optional>
#include <variant>

namespace API {
    enum class RestartMsgType : int;
}

namespace API {

    struct RestartMsg {
std::string toString() const;
void fromString(const std::string &str);
        int64_t id;
        RestartMsgType type = static_cast<RestartMsgType>(0);
    };
}
