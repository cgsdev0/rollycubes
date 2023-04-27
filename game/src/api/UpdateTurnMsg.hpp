
#pragma once


namespace API {
    enum class UpdateTurnMsgType : int;
}

namespace API {

    struct UpdateTurnMsg {
std::string toString() const;
void fromString(const std::string &str);
        int64_t id;
        UpdateTurnMsgType type = static_cast<UpdateTurnMsgType>(0);
    };
}
