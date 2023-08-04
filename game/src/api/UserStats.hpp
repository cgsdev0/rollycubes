//  To parse this JSON data, first install
//
//      json.hpp  https://github.com/nlohmann/json
//
//  Then include this file, and then do
//
//     UserStats.hpp data = nlohmann::json::parse(jsonString);

#pragma once

#include <optional>
#include "json.hpp"
#include "helper.hpp"

namespace API {
    using nlohmann::json;

    struct UserStats {
        int64_t doubles;
        int64_t games;
        int64_t rolls;
        int64_t wins;
    };
}
