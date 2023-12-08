
#pragma once

#include <optional>
#include <variant>

namespace API {
    enum class GameErrorType : int;
}

namespace API {

    struct GameError {
std::string toString() const;
void fromString(const std::string &str);
        std::string error;
        GameErrorType type = static_cast<GameErrorType>(0);
    };
}
