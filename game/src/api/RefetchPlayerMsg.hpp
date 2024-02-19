
#pragma once

#include <optional>
#include <variant>

namespace API {
    enum class RefetchPlayerMsgType : int;
}

namespace API {

    struct RefetchPlayerMsg {
std::string toString() const;
void fromString(const std::string &str);
        RefetchPlayerMsgType type = static_cast<RefetchPlayerMsgType>(0);
        std::string user_id;
    };
}
