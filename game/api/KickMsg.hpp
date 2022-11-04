
#pragma once


namespace API {
    enum class KickMsgType : int;
}

namespace API {

    struct KickMsg {
        double id;
        KickMsgType type = 0;
    };
}
