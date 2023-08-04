//  To parse this JSON data, first install
//
//      json.hpp  https://github.com/nlohmann/json
//
//  Then include this file, and then do
//
//     UpdateNameMsg.hpp data = nlohmann::json::parse(jsonString);

#pragma once

#include <optional>
#include "json.hpp"
#include "helper.hpp"

namespace API {
    enum class UpdateNameMsgType : int;
}

namespace API {
    using nlohmann::json;

    struct UpdateNameMsg {
        int64_t id;
        std::string name;
        UpdateNameMsgType type;
    };
}
