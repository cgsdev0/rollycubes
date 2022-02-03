#pragma once

#include <string>
#include <vector>

#define JSON_SERIALIZABLE() \
    std::string toString(); \
    void fromString(const std::string &str);

namespace API {

    struct Redirect {
        std::string room;

        JSON_SERIALIZABLE()
    };

    struct Room {
        std::string code;
        std::string host_name;
        std::string last_updated;
        int player_count;

        JSON_SERIALIZABLE()
    };

    struct Room_List {
        std::vector<Room> rooms;
        JSON_SERIALIZABLE()
    };
} // namespace API