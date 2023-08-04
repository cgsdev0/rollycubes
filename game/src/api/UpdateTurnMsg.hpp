//  To parse this JSON data, first install
//
//      json.hpp  https://github.com/nlohmann/json
//
//  Then include this file, and then do
//
//     UpdateTurnMsg.hpp data = nlohmann::json::parse(jsonString);

#pragma once

#include <optional>
#include "json.hpp"
#include "helper.hpp"

namespace API {
    enum class UpdateTurnMsgType : int;
}

namespace API {
    using nlohmann::json;

    struct UpdateTurnMsg {
        int64_t id;
        std::optional<bool> skip;
        UpdateTurnMsgType type;
    };
}
