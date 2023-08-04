
#pragma once

#include <optional>

namespace API {
    struct ServerPlayer;
    enum class GameStateType : int;
}

namespace API {

    struct GameState {
std::string toString() const;
void fromString(const std::string &str);
        std::vector<std::string> chat_log;
        std::vector<ServerPlayer> players;
        bool private_session;
        bool rolled;
        std::vector<double> rolls;
        int64_t spectators;
        int64_t turn_index;
        GameStateType type = static_cast<GameStateType>(0);
        std::vector<bool> used;
        bool victory;
    };
}
