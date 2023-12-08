
#pragma once

#include <optional>
#include <variant>

namespace API {
    enum class ChatMsgType : int;
}

namespace API {

    struct ChatMsg {
std::string toString() const;
void fromString(const std::string &str);
        std::string msg;
        ChatMsgType type = static_cast<ChatMsgType>(0);
    };
}
