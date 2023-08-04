
#pragma once

#include <optional>

namespace API {

    struct Player {
        bool connected;
        std::optional<bool> crowned;
        std::optional<std::string> name;
        int64_t score;
        int64_t skip_count;
        std::optional<std::string> user_id;
        int64_t win_count;
    };
}
