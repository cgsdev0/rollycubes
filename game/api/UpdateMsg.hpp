
#pragma once


namespace API {
    enum class UpdateMsgType : int;
}

namespace API {

    struct UpdateMsg {
        double id;
        std::shared_ptr<bool> reset;
        double score;
        UpdateMsgType type = 0;
        std::shared_ptr<std::vector<bool>> used;
    };
}
