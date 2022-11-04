
#pragma once


namespace API {
    enum class WinMsgType : int;
}

namespace API {

    struct WinMsg {
        double id;
        WinMsgType type = 0;
    };
}
