
#pragma once

#include <optional>

namespace API {

    struct Dice {
std::string toString() const;
void fromString(const std::string &str);
        double type;
    };
}
