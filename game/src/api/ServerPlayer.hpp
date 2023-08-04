
#pragma once

#include <optional>

namespace API {

    struct ServerPlayer {
        bool connected;
        std::optional<bool> crowned;
        int64_t doubles_count;
        std::optional<std::string> name;
        int64_t roll_count;
        int64_t score;
        std::string session;
        int64_t skip_count;
        int64_t turn_count;
        std::optional<std::string> user_id;
        int64_t win_count;
    };
}
