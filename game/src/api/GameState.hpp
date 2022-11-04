
#pragma once


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
        double turn_index;
        GameStateType type = static_cast<GameStateType>(0);
        std::vector<bool> used;
        bool victory;
    };
}
