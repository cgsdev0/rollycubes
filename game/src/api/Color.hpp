
#pragma once

#include <optional>

namespace API {

    struct Color {
std::string toString() const;
void fromString(const std::string &str);
        double hue;
        double sat;
    };
}
