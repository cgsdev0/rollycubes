
#pragma once

#include <optional>

namespace API {
    struct Room;
}

namespace API {

    struct RoomList {
std::string toString() const;
void fromString(const std::string &str);
        std::vector<Room> rooms;
    };
}
