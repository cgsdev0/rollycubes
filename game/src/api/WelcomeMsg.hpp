
#pragma once

#include <optional>
#include <variant>

namespace API {
    struct Player;
    struct RichTextMsg;
    enum class WelcomeMsgType : int;
}

namespace API {

    struct WelcomeMsg {
std::string toString() const;
void fromString(const std::string &str);
        std::vector<std::string> chat_log;
        int64_t id;
        std::vector<Player> players;
        bool private_session;
        std::vector<RichTextMsg> rich_chat_log;
        bool rolled;
        std::vector<int64_t> rolls;
        int64_t spectators;
        int64_t turn_index;
        WelcomeMsgType type = static_cast<WelcomeMsgType>(0);
        std::vector<bool> used;
        bool victory;
    };
}
