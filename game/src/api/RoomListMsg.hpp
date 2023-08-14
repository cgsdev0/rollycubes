
#pragma once

#include <optional>

namespace API {
    struct Room;
    enum class RoomListMsgType : int;
}

namespace API {

    struct RoomListMsg {
std::string toString() const;
void fromString(const std::string &str);
        std::vector<Room> rooms;
        std::optional<RoomListMsgType> type;
    };
}
