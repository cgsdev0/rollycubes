
#pragma once


namespace API {
    enum class ChatMsgType : int;
}

namespace API {

    struct ChatMsg {
        std::string msg;
        ChatMsgType type = 0;
    };
}
