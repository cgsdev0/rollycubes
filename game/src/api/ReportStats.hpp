
#pragma once


#include "ReportStatsUserId.hpp"

namespace API {

    struct ReportStats {
std::string toString() const;
void fromString(const std::string &str);
        int64_t doubles;
        int64_t games;
        int64_t rolls;
        ReportStatsUserId user_id;
        int64_t wins;
    };
}
