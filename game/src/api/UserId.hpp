//  To parse this JSON data, first install
//
//      json.hpp  https://github.com/nlohmann/json
//
//  Then include this file, and then do
//
//     UserId.hpp data = nlohmann::json::parse(jsonString);

#pragma once

#include <optional>
#include "json.hpp"
#include "helper.hpp"

namespace API {
    enum class UserIdType : int;
}

namespace API {
    using nlohmann::json;

    struct UserId {
        std::string id;
        UserIdType type;
    };
}
