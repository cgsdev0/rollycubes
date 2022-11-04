
#pragma once


namespace API {
    enum class WinMsgType : int;
}

namespace API {

    struct WinMsg {
std::string toString() const;
void fromString(const std::string &str);
        double id;
        WinMsgType type = static_cast<WinMsgType>(0);
    };
}
