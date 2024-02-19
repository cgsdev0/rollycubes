
#pragma once

#include <optional>
#include <variant>

namespace API {
    struct ServerPlayer;
    struct RichTextMsg;
    enum class GameStateType : int;
}

namespace API {

    struct GameState {
std::string toString() const;
void fromString(const std::string &str);
        std::vector<std::string> chat_log;
        std::vector<ServerPlayer> players;
        bool private_session;
        std::vector<RichTextMsg> rich_chat_log;
        bool rolled;
        std::vector<int64_t> rolls;
        int64_t spectators;
        int64_t turn_index;
        GameStateType type = static_cast<GameStateType>(0);
        std::vector<bool> used;
        bool victory;
    };
}
