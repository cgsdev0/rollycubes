
#pragma once

#include <optional>
#include <variant>

namespace API {
    enum class RollAgainMsgType : int;
}

namespace API {

    struct RollAgainMsg {
std::string toString() const;
void fromString(const std::string &str);
        RollAgainMsgType type = static_cast<RollAgainMsgType>(0);
    };
}
