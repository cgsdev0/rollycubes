
#pragma once

#include <optional>

namespace API {
    enum class RollMsgType : int;
}

namespace API {

    struct RollMsg {
std::string toString() const;
void fromString(const std::string &str);
        std::vector<double> rolls;
        RollMsgType type = static_cast<RollMsgType>(0);
    };
}
