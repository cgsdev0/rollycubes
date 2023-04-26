
#pragma once


#include "ReportStatsUserId.hpp"

namespace API {

    struct ReportStats {
std::string toString() const;
void fromString(const std::string &str);
        double doubles;
        double games;
        double rolls;
        ReportStatsUserId user_id;
        double wins;
    };
}
