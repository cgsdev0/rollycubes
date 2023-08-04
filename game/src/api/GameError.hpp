
#pragma once

#include <optional>

namespace API {
    enum class GameErrorType : int;
}

namespace API {

    struct GameError {
        std::string error;
        GameErrorType type;
    };
}
