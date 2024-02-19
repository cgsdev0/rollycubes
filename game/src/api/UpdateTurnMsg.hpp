
#pragma once

#include <optional>
#include <variant>

namespace API {
    enum class UpdateTurnMsgType : int;
}

namespace API {

    struct UpdateTurnMsg {
std::string toString() const;
void fromString(const std::string &str);
        int64_t id;
        std::optional<bool> skip;
        UpdateTurnMsgType type = static_cast<UpdateTurnMsgType>(0);
    };
}
