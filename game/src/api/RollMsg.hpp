
#pragma once

#include <optional>
#include <variant>

namespace API {
    enum class RollMsgType : int;
}

namespace API {

    struct RollMsg {
std::string toString() const;
void fromString(const std::string &str);
        std::vector<int64_t> rolls;
        RollMsgType type = static_cast<RollMsgType>(0);
    };
}
