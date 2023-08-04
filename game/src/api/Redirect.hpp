//  To parse this JSON data, first install
//
//      json.hpp  https://github.com/nlohmann/json
//
//  Then include this file, and then do
//
//     Redirect.hpp data = nlohmann::json::parse(jsonString);

#pragma once

#include <optional>
#include "json.hpp"
#include "helper.hpp"

namespace API {
    enum class RedirectType : int;
}

namespace API {
    using nlohmann::json;

    struct Redirect {
        std::string room;
        RedirectType type;
    };
}
