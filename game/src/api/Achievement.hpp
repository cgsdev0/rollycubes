
#pragma once

#include <optional>

namespace API {

    struct Achievement {
        std::string id;
        int64_t progress;
        std::optional<double> rd;
        std::optional<double> rn;
        std::string unlocked;
    };
}
