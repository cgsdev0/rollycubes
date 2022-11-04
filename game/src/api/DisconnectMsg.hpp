
#pragma once


namespace API {
    enum class DisconnectMsgType : int;
}

namespace API {

    struct DisconnectMsg {
        double id;
        DisconnectMsgType type = 0;
    };
}
