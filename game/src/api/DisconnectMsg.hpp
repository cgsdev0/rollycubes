
#pragma once


namespace API {
    enum class DisconnectMsgType : int;
}

namespace API {

    struct DisconnectMsg {
std::string toString() const;
void fromString(const std::string &str);
        double id;
        DisconnectMsgType type = static_cast<DisconnectMsgType>(0);
    };
}
