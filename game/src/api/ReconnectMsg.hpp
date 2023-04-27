
#pragma once


namespace API {
    enum class ReconnectMsgType : int;
}

namespace API {

    struct ReconnectMsg {
std::string toString() const;
void fromString(const std::string &str);
        int64_t id;
        ReconnectMsgType type = static_cast<ReconnectMsgType>(0);
    };
}
