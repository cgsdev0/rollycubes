
#pragma once


namespace API {
    enum class RestartMsgType : int;
}

namespace API {

    struct RestartMsg {
std::string toString() const;
void fromString(const std::string &str);
        double id;
        RestartMsgType type = static_cast<RestartMsgType>(0);
    };
}
