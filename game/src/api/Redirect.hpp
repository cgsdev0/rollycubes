
#pragma once

#include <optional>
#include <variant>

namespace API {
    enum class RedirectType : int;
}

namespace API {

    struct Redirect {
std::string toString() const;
void fromString(const std::string &str);
        std::string room;
        RedirectType type = static_cast<RedirectType>(0);
    };
}
