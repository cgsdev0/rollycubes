
#pragma once

#include <optional>

namespace API {

    struct Room {
        std::string code;
        std::string host_name;
        std::string last_updated;
        int64_t player_count;
    };
}
