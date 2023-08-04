
#pragma once

#include <optional>

namespace API {
    struct Player;
    enum class WelcomeMsgType : int;
}

namespace API {

    struct WelcomeMsg {
        std::vector<std::string> chat_log;
        int64_t id;
        std::vector<Player> players;
        bool private_session;
        bool rolled;
        std::vector<double> rolls;
        int64_t spectators;
        int64_t turn_index;
        WelcomeMsgType type = static_cast<WelcomeMsgType>(0);
        std::vector<bool> used;
        bool victory;
    };
}
