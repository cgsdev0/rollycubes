
#pragma once

#include <optional>
#include <variant>

namespace API {
    enum class ReconnectMsgType : int;
}

namespace API {

    struct ReconnectMsg {
std::string toString() const;
void fromString(const std::string &str);
        int64_t id;
        std::optional<std::string> name;
        ReconnectMsgType type = static_cast<ReconnectMsgType>(0);
        std::optional<std::string> user_id;
    };
}
