
#pragma once


namespace API {
    enum class ReconnectMsgType : int;
}

namespace API {

    struct ReconnectMsg {
        double id;
        ReconnectMsgType type = 0;
    };
}
