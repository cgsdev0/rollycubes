//  To parse this JSON data, first install
//
//      json.hpp  https://github.com/nlohmann/json
//
//  Then include this file, and then do
//
//     GameState.hpp data = nlohmann::json::parse(jsonString);

#pragma once

#include <optional>
#include "json.hpp"
#include "helper.hpp"

namespace API {
    struct ServerPlayer;
    enum class GameStateType : int;
}

namespace API {
    using nlohmann::json;

    struct GameState {
        std::vector<std::string> chat_log;
        std::vector<ServerPlayer> players;
        bool private_session;
        bool rolled;
        std::vector<double> rolls;
        int64_t spectators;
        int64_t turn_index;
        GameStateType type;
        std::vector<bool> used;
        bool victory;
    };
}
