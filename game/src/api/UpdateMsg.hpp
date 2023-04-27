
#pragma once


namespace API {
    enum class UpdateMsgType : int;
}

namespace API {

    struct UpdateMsg {
std::string toString() const;
void fromString(const std::string &str);
        int64_t id;
        std::shared_ptr<bool> reset;
        int64_t score;
        UpdateMsgType type = static_cast<UpdateMsgType>(0);
        std::shared_ptr<std::vector<bool>> used;
    };
}
