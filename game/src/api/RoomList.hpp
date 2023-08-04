
#pragma once

#include <optional>

namespace API {
    struct Room;
}

namespace API {

    struct RoomList {
        std::vector<Room> rooms;
    };
}
