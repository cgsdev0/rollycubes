
#pragma once

#include <optional>

#include "UserId.hpp"

namespace API {

    struct ReportStats {
std::string toString() const;
void fromString(const std::string &str);
        int64_t doubles;
        int64_t games;
        int64_t rolls;
        UserId user_id;
        int64_t wins;
    };
}
