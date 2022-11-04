
#pragma once


namespace API {
    enum class RestartMsgType : int;
}

namespace API {

    struct RestartMsg {
        double id;
        RestartMsgType type = 0;
    };
}
