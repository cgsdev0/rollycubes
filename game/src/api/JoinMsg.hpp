
#pragma once


namespace API {
    enum class JoinMsgType : int;
}

namespace API {

    struct JoinMsg {
std::string toString() const;
void fromString(const std::string &str);
        int64_t id;
        std::shared_ptr<std::string> name;
        JoinMsgType type = static_cast<JoinMsgType>(0);
        std::shared_ptr<std::string> user_id;
    };
}
