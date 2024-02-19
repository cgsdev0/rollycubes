
#pragma once

#include <optional>
#include <variant>

namespace API {

    enum class ServerMsgType : int { CHAT, CHAT_V2, DISCONNECT, JOIN, KICK, RECONNECT, REFETCH_PLAYER, RESTART, ROLL, ROLL_AGAIN, ROOM_LIST, SPECTATORS, UPDATE, UPDATE_NAME, UPDATE_TURN, WELCOME, WIN };
}
