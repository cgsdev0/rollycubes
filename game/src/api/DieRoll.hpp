
#pragma once

#include <optional>
#include <variant>

namespace API {

    struct DieRoll {
std::string toString() const;
void fromString(const std::string &str);
        bool used;
        int64_t value;
    };
}
