
#pragma once

#include <optional>
#include <variant>

namespace API {
    enum class JoinMsgType : int;
}

namespace API {

    struct JoinMsg {
std::string toString() const;
void fromString(const std::string &str);
        int64_t id;
        std::optional<std::string> name;
        JoinMsgType type = static_cast<JoinMsgType>(0);
        std::optional<std::string> user_id;
    };
}
