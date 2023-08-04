
#pragma once

#include <optional>

namespace API {
    enum class UpdateMsgType : int;
}

namespace API {

    struct UpdateMsg {
std::string toString() const;
void fromString(const std::string &str);
        int64_t id;
        std::optional<bool> reset;
        int64_t score;
        UpdateMsgType type = static_cast<UpdateMsgType>(0);
        std::optional<std::vector<bool>> used;
    };
}
