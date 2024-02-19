
#pragma once

#include <optional>
#include <variant>

namespace API {

    struct Achievement {
std::string toString() const;
void fromString(const std::string &str);
        std::string id;
        int64_t progress;
        std::optional<int64_t> rd;
        std::optional<int64_t> rn;
        std::string unlocked;
    };
}
