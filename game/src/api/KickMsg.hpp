
#pragma once

#include <optional>
#include <variant>

namespace API {
    enum class KickMsgType : int;
}

namespace API {

    struct KickMsg {
std::string toString() const;
void fromString(const std::string &str);
        int64_t id;
        KickMsgType type = static_cast<KickMsgType>(0);
    };
}
