
#pragma once

#include <optional>
#include <variant>

namespace API {

    struct Room {
std::string toString() const;
void fromString(const std::string &str);
        std::string code;
        std::string host_name;
        std::string last_updated;
        int64_t player_count;
    };
}
