
#pragma once

#include <optional>

namespace API {
    struct Player;
}

namespace API {

    struct IGameState {
std::string toString() const;
void fromString(const std::string &str);
        std::vector<std::string> chat_log;
        std::vector<Player> players;
        bool private_session;
        bool rolled;
        std::vector<double> rolls;
        int64_t spectators;
        int64_t turn_index;
        std::vector<bool> used;
        bool victory;
    };
}
