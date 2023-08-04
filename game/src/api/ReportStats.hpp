//  To parse this JSON data, first install
//
//      json.hpp  https://github.com/nlohmann/json
//
//  Then include this file, and then do
//
//     ReportStats.hpp data = nlohmann::json::parse(jsonString);

#pragma once

#include <optional>
#include "json.hpp"
#include "helper.hpp"

#include "UserId.hpp"

namespace API {
    using nlohmann::json;

    struct ReportStats {
        int64_t doubles;
        int64_t games;
        int64_t rolls;
        UserId user_id;
        int64_t wins;
    };
}
