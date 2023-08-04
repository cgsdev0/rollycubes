//  To parse this JSON data, first install
//
//      json.hpp  https://github.com/nlohmann/json
//
//  Then include this file, and then do
//
//     ReconnectMsg.hpp data = nlohmann::json::parse(jsonString);

#pragma once

#include <optional>
#include "json.hpp"
#include "helper.hpp"

namespace API {
    enum class ReconnectMsgType : int;
}

namespace API {
    using nlohmann::json;

    struct ReconnectMsg {
        int64_t id;
        std::optional<std::string> name;
        ReconnectMsgType type;
        std::optional<std::string> user_id;
    };
}
