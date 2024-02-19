
#pragma once

#include <optional>
#include <variant>

#include "ServerMsgMsg.hpp"
#include "MsgElement.hpp"
#include "RichTextChunk.hpp"

namespace API {
    struct Room;
    enum class ServerMsgType : int;
    struct Player;
    struct RichTextMsg;
}

namespace API {
    /**
     * TODO: add descriptions to these things
     */


    /**
     * TODO: add descriptions to these things
     */
    struct ServerMsg {
std::string toString() const;
void fromString(const std::string &str);
        std::optional<std::vector<Room>> rooms;
        std::optional<ServerMsgType> type;
        std::optional<std::string> user_id;
        std::optional<std::vector<std::string>> chat_log;
        std::optional<int64_t> id;
        std::optional<std::vector<Player>> players;
        std::optional<bool> private_session;
        std::optional<std::vector<RichTextMsg>> rich_chat_log;
        std::optional<bool> rolled;
        std::optional<std::vector<int64_t>> rolls;
        std::optional<int64_t> spectators;
        std::optional<int64_t> turn_index;
        std::optional<std::vector<bool>> used;
        std::optional<bool> victory;
        std::optional<int64_t> count;
        std::optional<std::string> name;
        std::optional<ServerMsgMsg> msg;
        std::optional<bool> skip;
        std::optional<bool> reset;
        std::optional<int64_t> score;
    };
}
