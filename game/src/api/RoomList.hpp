//  To parse this JSON data, first install
//
//      json.hpp  https://github.com/nlohmann/json
//
//  Then include this file, and then do
//
//     RoomList.hpp data = nlohmann::json::parse(jsonString);

#pragma once

#include <optional>
#include "json.hpp"
#include "helper.hpp"

namespace API {
    struct Room;
}

namespace API {
    using nlohmann::json;

    struct RoomList {
        std::vector<Room> rooms;
    };
}
