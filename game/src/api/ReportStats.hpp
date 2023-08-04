
#pragma once

#include <optional>

#include "UserId.hpp"

namespace API {

    struct ReportStats {
        int64_t doubles;
        int64_t games;
        int64_t rolls;
        UserId user_id;
        int64_t wins;
    };
}
