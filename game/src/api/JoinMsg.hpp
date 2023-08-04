//  To parse this JSON data, first install
//
//      json.hpp  https://github.com/nlohmann/json
//
//  Then include this file, and then do
//
//     JoinMsg.hpp data = nlohmann::json::parse(jsonString);

#pragma once

#include <optional>
#include "json.hpp"
#include "helper.hpp"

namespace API {
    enum class JoinMsgType : int;
}

namespace API {
    using nlohmann::json;

    struct JoinMsg {
        int64_t id;
        std::optional<std::string> name;
        JoinMsgType type;
        std::optional<std::string> user_id;
    };
}
