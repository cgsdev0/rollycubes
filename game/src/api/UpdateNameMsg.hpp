
#pragma once


namespace API {
    enum class UpdateNameMsgType : int;
}

namespace API {

    struct UpdateNameMsg {
        double id;
        std::string name;
        UpdateNameMsgType type = 0;
    };
}
