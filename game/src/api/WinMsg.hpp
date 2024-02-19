
#pragma once

#include <optional>
#include <variant>

namespace API {
    enum class WinMsgType : int;
}

namespace API {

    struct WinMsg {
std::string toString() const;
void fromString(const std::string &str);
        int64_t id;
        WinMsgType type = static_cast<WinMsgType>(0);
    };
}
