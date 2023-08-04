//  To parse this JSON data, first install
//
//      json.hpp  https://github.com/nlohmann/json
//
//  Then include this file, and then do
//
//     WelcomeMsg.hpp data = nlohmann::json::parse(jsonString);

#pragma once

#include <optional>
#include "json.hpp"
#include "helper.hpp"

namespace API {
    struct Player;
    enum class WelcomeMsgType : int;
}

namespace API {
    using nlohmann::json;

    struct WelcomeMsg {
        std::vector<std::string> chat_log;
        int64_t id;
        std::vector<Player> players;
        bool private_session;
        bool rolled;
        std::vector<double> rolls;
        int64_t spectators;
        int64_t turn_index;
        WelcomeMsgType type;
        std::vector<bool> used;
        bool victory;
    };
}
