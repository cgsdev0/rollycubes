
#pragma once

#include <optional>

namespace API {
    enum class SpectatorsMsgType : int;
}

namespace API {

    struct SpectatorsMsg {
std::string toString() const;
void fromString(const std::string &str);
        int64_t count;
        SpectatorsMsgType type = static_cast<SpectatorsMsgType>(0);
    };
}
