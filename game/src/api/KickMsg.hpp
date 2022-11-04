
#pragma once


namespace API {
    enum class KickMsgType : int;
}

namespace API {

    struct KickMsg {
std::string toString() const;
void fromString(const std::string &str);
        double id;
        KickMsgType type = static_cast<KickMsgType>(0);
    };
}
