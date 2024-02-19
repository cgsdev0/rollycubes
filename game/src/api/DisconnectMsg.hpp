
#pragma once

#include <optional>
#include <variant>

namespace API {
    enum class DisconnectMsgType : int;
}

namespace API {

    struct DisconnectMsg {
std::string toString() const;
void fromString(const std::string &str);
        int64_t id;
        DisconnectMsgType type = static_cast<DisconnectMsgType>(0);
    };
}
