
#pragma once

#include <optional>
#include <variant>

namespace API {

    struct Player {
std::string toString() const;
void fromString(const std::string &str);
        bool connected;
        std::optional<bool> crowned;
        std::optional<std::string> name;
        int64_t score;
        int64_t skip_count;
        std::optional<std::string> user_id;
        int64_t win_count;
    };
}
