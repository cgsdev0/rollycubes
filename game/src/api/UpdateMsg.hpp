
#pragma once

#include <optional>
#include <variant>

namespace API {
    enum class UpdateMsgType : int;
}

namespace API {
    /**
     * TODO: add descriptions to these things
     */


    /**
     * TODO: add descriptions to these things
     */
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
