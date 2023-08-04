//  To parse this JSON data, first install
//
//      json.hpp  https://github.com/nlohmann/json
//
//  Then include this file, and then do
//
//     Achievement.hpp data = nlohmann::json::parse(jsonString);

#pragma once

#include <optional>
#include "json.hpp"
#include "helper.hpp"

namespace API {
    using nlohmann::json;

    struct Achievement {
        std::string id;
        int64_t progress;
        std::optional<double> rd;
        std::optional<double> rn;
        std::string unlocked;
    };
}
