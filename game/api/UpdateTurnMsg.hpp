
#pragma once


namespace API {
    enum class UpdateTurnMsgType : int;
}

namespace API {

    struct UpdateTurnMsg {
        double id;
        UpdateTurnMsgType type = 0;
    };
}
