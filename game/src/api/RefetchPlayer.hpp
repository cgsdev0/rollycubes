//  To parse this JSON data, first install
//
//      json.hpp  https://github.com/nlohmann/json
//
//  Then include this file, and then do
//
//     RefetchPlayer.hpp data = nlohmann::json::parse(jsonString);

#pragma once

#include <optional>
#include "json.hpp"
#include "helper.hpp"

namespace API {
    enum class RefetchPlayerType : int;
}

namespace API {
    using nlohmann::json;

    struct RefetchPlayer {
        RefetchPlayerType type;
        std::string user_id;
    };
}
