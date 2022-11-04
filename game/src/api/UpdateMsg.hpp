
#pragma once


namespace API {
    enum class UpdateMsgType : int;
}

namespace API {

    struct UpdateMsg {
std::string toString() const;
void fromString(const std::string &str);
        double id;
        std::shared_ptr<bool> reset;
        double score;
        UpdateMsgType type = static_cast<UpdateMsgType>(0);
        std::shared_ptr<std::vector<bool>> used;
    };
}
