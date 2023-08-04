
#pragma once

#include <optional>

namespace API {
    enum class ChatMsgType : int;
}

namespace API {

    struct ChatMsg {
        std::string msg;
        ChatMsgType type = static_cast<ChatMsgType>(0);
    };
}
