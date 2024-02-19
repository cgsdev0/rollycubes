
#pragma once

#include <optional>
#include <variant>

namespace API {
    enum class DiceType : int;
}

namespace API {

    struct Dice {
std::string toString() const;
void fromString(const std::string &str);
        DiceType type = static_cast<DiceType>(0);
    };
}
