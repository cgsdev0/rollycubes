
#pragma once


namespace API {
    enum class ReconnectMsgType : int;
}

namespace API {

    struct ReconnectMsg {
std::string toString() const;
void fromString(const std::string &str);
        int64_t id;
        std::shared_ptr<std::string> name;
        ReconnectMsgType type = static_cast<ReconnectMsgType>(0);
        std::shared_ptr<std::string> user_id;
    };
}
