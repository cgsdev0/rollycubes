//  To parse this JSON data, first install
//
//      json.hpp  https://github.com/nlohmann/json
//
//  Then include this file, and then do
//
//     DisconnectMsgType.hpp data = nlohmann::json::parse(jsonString);

#pragma once

#include <optional>
#include "json.hpp"
#include "helper.hpp"

namespace API {
    using nlohmann::json;

    enum class DisconnectMsgType : int { DISCONNECT };
}
