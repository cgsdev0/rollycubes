
#pragma once

#include <optional>
#include <variant>

namespace API {

    struct Color {
std::string toString() const;
void fromString(const std::string &str);
        double hue;
        double sat;
    };
}
