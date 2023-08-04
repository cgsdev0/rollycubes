
#pragma once

#include <optional>

namespace API {

    struct Achievement {
std::string toString() const;
void fromString(const std::string &str);
        std::string id;
        int64_t progress;
        std::optional<double> rd;
        std::optional<double> rn;
        std::string unlocked;
    };
}
