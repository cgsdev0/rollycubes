
#pragma once

#include <optional>
#include <variant>

#include "Color.hpp"

namespace API {
    enum class Setting : int;
    enum class DiceType : int;
}

namespace API {

    struct AuthSettingsRequest {
std::string toString() const;
void fromString(const std::string &str);
        std::optional<Color> color;
        Setting setting;
        std::optional<DiceType> dice_type;
        std::optional<std::string> text;
    };
}
