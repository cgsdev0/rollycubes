//  To parse this JSON data, first install
//
//      json.hpp  https://github.com/nlohmann/json
//
//  Then include this file, and then do
//
//     UpdateMsg.hpp data = nlohmann::json::parse(jsonString);

#pragma once

#include <optional>
#include "json.hpp"
#include "helper.hpp"

namespace API {
    enum class UpdateMsgType : int;
}

namespace API {
    using nlohmann::json;

    struct UpdateMsg {
        int64_t id;
        std::optional<bool> reset;
        int64_t score;
        UpdateMsgType type;
        std::optional<std::vector<bool>> used;
    };
}
