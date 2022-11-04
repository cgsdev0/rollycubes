
#pragma once


namespace API {
    enum class JoinMsgType : int;
}

namespace API {

    struct JoinMsg {
        double id;
        std::shared_ptr<std::string> name;
        JoinMsgType type = 0;
        std::shared_ptr<std::string> user_id;
    };
}
