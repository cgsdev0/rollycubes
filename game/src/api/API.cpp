

#include "json.hpp"
#include "helper.hpp"

#include "UpdateMsg.hpp"
#include "UpdateMsgType.hpp"
#include "UpdateNameMsg.hpp"
#include "UpdateNameMsgType.hpp"
#include "UpdateTurnMsg.hpp"
#include "UpdateTurnMsgType.hpp"
#include "ChatMsg.hpp"
#include "ChatMsgType.hpp"
#include "KickMsg.hpp"
#include "KickMsgType.hpp"
#include "ReconnectMsg.hpp"
#include "ReconnectMsgType.hpp"
#include "DisconnectMsg.hpp"
#include "DisconnectMsgType.hpp"
#include "JoinMsg.hpp"
#include "JoinMsgType.hpp"
#include "RollAgainMsg.hpp"
#include "RollAgainMsgType.hpp"
#include "RollMsg.hpp"
#include "RollMsgType.hpp"
#include "WinMsg.hpp"
#include "WinMsgType.hpp"
#include "RestartMsg.hpp"
#include "RestartMsgType.hpp"
#include "WelcomeMsg.hpp"
#include "WelcomeMsgType.hpp"
#include "GameState.hpp"
#include "GameStateType.hpp"
#include "ServerPlayer.hpp"
#include "IGameState.hpp"
#include "Player.hpp"
#include "RoomList.hpp"
#include "Room.hpp"
#include "RefetchPlayer.hpp"
#include "RefetchPlayerType.hpp"
#include "Redirect.hpp"
#include "RedirectType.hpp"
#include "GameError.hpp"
#include "GameErrorType.hpp"
#include "DieRoll.hpp"
#include "UserData.hpp"
#include "UserStats.hpp"
#include "Dice.hpp"
#include "Color.hpp"
#include "Achievement.hpp"
#include "AchievementData.hpp"
#include "ReportStats.hpp"
#include "ReportStatsUserId.hpp"
#include "AchievementUnlock.hpp"
#include "AchievementUnlockType.hpp"
#include "AchievementProgress.hpp"
#include "AchievementProgressUserId.hpp"
#include "AchievementProgressType.hpp"
#include "UserId.hpp"
#include "UserIdType.hpp"

namespace API {
    using Integer = double;
    using DiceType = double;
}

namespace nlohmann {
    void from_json(const json & j, API::UserId & x);
    void to_json(json & j, const API::UserId & x);

    void from_json(const json & j, API::AchievementProgressUserId & x);
    void to_json(json & j, const API::AchievementProgressUserId & x);

    void from_json(const json & j, API::AchievementProgress & x);
    void to_json(json & j, const API::AchievementProgress & x);

    void from_json(const json & j, API::AchievementUnlock & x);
    void to_json(json & j, const API::AchievementUnlock & x);

    void from_json(const json & j, API::ReportStatsUserId & x);
    void to_json(json & j, const API::ReportStatsUserId & x);

    void from_json(const json & j, API::ReportStats & x);
    void to_json(json & j, const API::ReportStats & x);

    void from_json(const json & j, API::AchievementData & x);
    void to_json(json & j, const API::AchievementData & x);

    void from_json(const json & j, API::Achievement & x);
    void to_json(json & j, const API::Achievement & x);

    void from_json(const json & j, API::Color & x);
    void to_json(json & j, const API::Color & x);

    void from_json(const json & j, API::Dice & x);
    void to_json(json & j, const API::Dice & x);

    void from_json(const json & j, API::UserStats & x);
    void to_json(json & j, const API::UserStats & x);

    void from_json(const json & j, API::UserData & x);
    void to_json(json & j, const API::UserData & x);

    void from_json(const json & j, API::DieRoll & x);
    void to_json(json & j, const API::DieRoll & x);

    void from_json(const json & j, API::GameError & x);
    void to_json(json & j, const API::GameError & x);

    void from_json(const json & j, API::Redirect & x);
    void to_json(json & j, const API::Redirect & x);

    void from_json(const json & j, API::RefetchPlayer & x);
    void to_json(json & j, const API::RefetchPlayer & x);

    void from_json(const json & j, API::Room & x);
    void to_json(json & j, const API::Room & x);

    void from_json(const json & j, API::RoomList & x);
    void to_json(json & j, const API::RoomList & x);

    void from_json(const json & j, API::Player & x);
    void to_json(json & j, const API::Player & x);

    void from_json(const json & j, API::IGameState & x);
    void to_json(json & j, const API::IGameState & x);

    void from_json(const json & j, API::ServerPlayer & x);
    void to_json(json & j, const API::ServerPlayer & x);

    void from_json(const json & j, API::GameState & x);
    void to_json(json & j, const API::GameState & x);

    void from_json(const json & j, API::WelcomeMsg & x);
    void to_json(json & j, const API::WelcomeMsg & x);

    void from_json(const json & j, API::RestartMsg & x);
    void to_json(json & j, const API::RestartMsg & x);

    void from_json(const json & j, API::WinMsg & x);
    void to_json(json & j, const API::WinMsg & x);

    void from_json(const json & j, API::RollMsg & x);
    void to_json(json & j, const API::RollMsg & x);

    void from_json(const json & j, API::RollAgainMsg & x);
    void to_json(json & j, const API::RollAgainMsg & x);

    void from_json(const json & j, API::JoinMsg & x);
    void to_json(json & j, const API::JoinMsg & x);

    void from_json(const json & j, API::DisconnectMsg & x);
    void to_json(json & j, const API::DisconnectMsg & x);

    void from_json(const json & j, API::ReconnectMsg & x);
    void to_json(json & j, const API::ReconnectMsg & x);

    void from_json(const json & j, API::KickMsg & x);
    void to_json(json & j, const API::KickMsg & x);

    void from_json(const json & j, API::ChatMsg & x);
    void to_json(json & j, const API::ChatMsg & x);

    void from_json(const json & j, API::UpdateTurnMsg & x);
    void to_json(json & j, const API::UpdateTurnMsg & x);

    void from_json(const json & j, API::UpdateNameMsg & x);
    void to_json(json & j, const API::UpdateNameMsg & x);

    void from_json(const json & j, API::UpdateMsg & x);
    void to_json(json & j, const API::UpdateMsg & x);

    void from_json(const json & j, API::UserIdType & x);
    void to_json(json & j, const API::UserIdType & x);

    void from_json(const json & j, API::AchievementProgressType & x);
    void to_json(json & j, const API::AchievementProgressType & x);

    void from_json(const json & j, API::AchievementUnlockType & x);
    void to_json(json & j, const API::AchievementUnlockType & x);

    void from_json(const json & j, API::GameErrorType & x);
    void to_json(json & j, const API::GameErrorType & x);

    void from_json(const json & j, API::RedirectType & x);
    void to_json(json & j, const API::RedirectType & x);

    void from_json(const json & j, API::RefetchPlayerType & x);
    void to_json(json & j, const API::RefetchPlayerType & x);

    void from_json(const json & j, API::GameStateType & x);
    void to_json(json & j, const API::GameStateType & x);

    void from_json(const json & j, API::WelcomeMsgType & x);
    void to_json(json & j, const API::WelcomeMsgType & x);

    void from_json(const json & j, API::RestartMsgType & x);
    void to_json(json & j, const API::RestartMsgType & x);

    void from_json(const json & j, API::WinMsgType & x);
    void to_json(json & j, const API::WinMsgType & x);

    void from_json(const json & j, API::RollMsgType & x);
    void to_json(json & j, const API::RollMsgType & x);

    void from_json(const json & j, API::RollAgainMsgType & x);
    void to_json(json & j, const API::RollAgainMsgType & x);

    void from_json(const json & j, API::JoinMsgType & x);
    void to_json(json & j, const API::JoinMsgType & x);

    void from_json(const json & j, API::DisconnectMsgType & x);
    void to_json(json & j, const API::DisconnectMsgType & x);

    void from_json(const json & j, API::ReconnectMsgType & x);
    void to_json(json & j, const API::ReconnectMsgType & x);

    void from_json(const json & j, API::KickMsgType & x);
    void to_json(json & j, const API::KickMsgType & x);

    void from_json(const json & j, API::ChatMsgType & x);
    void to_json(json & j, const API::ChatMsgType & x);

    void from_json(const json & j, API::UpdateTurnMsgType & x);
    void to_json(json & j, const API::UpdateTurnMsgType & x);

    void from_json(const json & j, API::UpdateNameMsgType & x);
    void to_json(json & j, const API::UpdateNameMsgType & x);

    void from_json(const json & j, API::UpdateMsgType & x);
    void to_json(json & j, const API::UpdateMsgType & x);

    inline void from_json(const json & j, API::UserId& x) {
        x.id = j.at("id").get<std::string>();
        x.type = j.at("type").get<API::UserIdType>();
    }

    inline void to_json(json & j, const API::UserId & x) {
        j = json::object();
        j["id"] = x.id;
        j["type"] = x.type;
    }

    inline void from_json(const json & j, API::AchievementProgressUserId& x) {
        x.id = j.at("id").get<std::string>();
        x.type = j.at("type").get<API::UserIdType>();
    }

    inline void to_json(json & j, const API::AchievementProgressUserId & x) {
        j = json::object();
        j["id"] = x.id;
        j["type"] = x.type;
    }

    inline void from_json(const json & j, API::AchievementProgress& x) {
        x.achievement_id = j.at("achievement_id").get<std::string>();
        x.progress = j.at("progress").get<int64_t>();
        x.type = j.at("type").get<API::AchievementProgressType>();
        x.user_id = j.at("user_id").get<API::AchievementProgressUserId>();
        x.user_index = j.at("user_index").get<int64_t>();
    }

    inline void to_json(json & j, const API::AchievementProgress & x) {
        j = json::object();
        j["achievement_id"] = x.achievement_id;
        j["progress"] = x.progress;
        j["type"] = x.type;
        j["user_id"] = x.user_id;
        j["user_index"] = x.user_index;
    }

    inline void from_json(const json & j, API::AchievementUnlock& x) {
        x.description = j.at("description").get<std::string>();
        x.id = j.at("id").get<std::string>();
        x.image_url = API::get_optional<std::string>(j, "image_url");
        x.max_progress = j.at("max_progress").get<int64_t>();
        x.name = j.at("name").get<std::string>();
        x.type = j.at("type").get<API::AchievementUnlockType>();
        x.user_id = j.at("user_id").get<std::string>();
        x.user_index = j.at("user_index").get<int64_t>();
    }

    inline void to_json(json & j, const API::AchievementUnlock & x) {
        j = json::object();
        j["description"] = x.description;
        j["id"] = x.id;
        j["image_url"] = x.image_url;
        j["max_progress"] = x.max_progress;
        j["name"] = x.name;
        j["type"] = x.type;
        j["user_id"] = x.user_id;
        j["user_index"] = x.user_index;
    }

    inline void from_json(const json & j, API::ReportStatsUserId& x) {
        x.id = j.at("id").get<std::string>();
        x.type = j.at("type").get<API::UserIdType>();
    }

    inline void to_json(json & j, const API::ReportStatsUserId & x) {
        j = json::object();
        j["id"] = x.id;
        j["type"] = x.type;
    }

    inline void from_json(const json & j, API::ReportStats& x) {
        x.doubles = j.at("doubles").get<int64_t>();
        x.games = j.at("games").get<int64_t>();
        x.rolls = j.at("rolls").get<int64_t>();
        x.user_id = j.at("user_id").get<API::ReportStatsUserId>();
        x.wins = j.at("wins").get<int64_t>();
    }

    inline void to_json(json & j, const API::ReportStats & x) {
        j = json::object();
        j["doubles"] = x.doubles;
        j["games"] = x.games;
        j["rolls"] = x.rolls;
        j["user_id"] = x.user_id;
        j["wins"] = x.wins;
    }

    inline void from_json(const json & j, API::AchievementData& x) {
        x.description = j.at("description").get<std::string>();
        x.id = j.at("id").get<std::string>();
        x.image_url = API::get_optional<std::string>(j, "image_url");
        x.max_progress = j.at("max_progress").get<int64_t>();
        x.name = j.at("name").get<std::string>();
    }

    inline void to_json(json & j, const API::AchievementData & x) {
        j = json::object();
        j["description"] = x.description;
        j["id"] = x.id;
        j["image_url"] = x.image_url;
        j["max_progress"] = x.max_progress;
        j["name"] = x.name;
    }

    inline void from_json(const json & j, API::Achievement& x) {
        x.id = j.at("id").get<std::string>();
        x.progress = j.at("progress").get<int64_t>();
        x.rd = API::get_optional<double>(j, "rd");
        x.rn = API::get_optional<double>(j, "rn");
        x.unlocked = j.at("unlocked").get<std::string>();
    }

    inline void to_json(json & j, const API::Achievement & x) {
        j = json::object();
        j["id"] = x.id;
        j["progress"] = x.progress;
        j["rd"] = x.rd;
        j["rn"] = x.rn;
        j["unlocked"] = x.unlocked;
    }

    inline void from_json(const json & j, API::Color& x) {
        x.hue = j.at("hue").get<double>();
        x.sat = j.at("sat").get<double>();
    }

    inline void to_json(json & j, const API::Color & x) {
        j = json::object();
        j["hue"] = x.hue;
        j["sat"] = x.sat;
    }

    inline void from_json(const json & j, API::Dice& x) {
        x.type = j.at("type").get<double>();
    }

    inline void to_json(json & j, const API::Dice & x) {
        j = json::object();
        j["type"] = x.type;
    }

    inline void from_json(const json & j, API::UserStats& x) {
        x.doubles = j.at("doubles").get<int64_t>();
        x.games = j.at("games").get<int64_t>();
        x.rolls = j.at("rolls").get<int64_t>();
        x.wins = j.at("wins").get<int64_t>();
    }

    inline void to_json(json & j, const API::UserStats & x) {
        j = json::object();
        j["doubles"] = x.doubles;
        j["games"] = x.games;
        j["rolls"] = x.rolls;
        j["wins"] = x.wins;
    }

    inline void from_json(const json & j, API::UserData& x) {
        x.achievements = API::get_optional<std::vector<API::Achievement>>(j, "achievements");
        x.color = j.at("color").get<API::Color>();
        x.created_date = j.at("createdDate").get<std::string>();
        x.dice = j.at("dice").get<API::Dice>();
        x.donor = j.at("donor").get<bool>();
        x.id = j.at("id").get<std::string>();
        x.image_url = API::get_optional<std::string>(j, "image_url");
        x.pubkey_text = API::get_optional<std::string>(j, "pubkey_text");
        x.stats = API::get_optional<API::UserStats>(j, "stats");
        x.username = j.at("username").get<std::string>();
    }

    inline void to_json(json & j, const API::UserData & x) {
        j = json::object();
        j["achievements"] = x.achievements;
        j["color"] = x.color;
        j["createdDate"] = x.created_date;
        j["dice"] = x.dice;
        j["donor"] = x.donor;
        j["id"] = x.id;
        j["image_url"] = x.image_url;
        j["pubkey_text"] = x.pubkey_text;
        j["stats"] = x.stats;
        j["username"] = x.username;
    }

    inline void from_json(const json & j, API::DieRoll& x) {
        x.used = j.at("used").get<bool>();
        x.value = j.at("value").get<int64_t>();
    }

    inline void to_json(json & j, const API::DieRoll & x) {
        j = json::object();
        j["used"] = x.used;
        j["value"] = x.value;
    }

    inline void from_json(const json & j, API::GameError& x) {
        x.error = j.at("error").get<std::string>();
        x.type = j.at("type").get<API::GameErrorType>();
    }

    inline void to_json(json & j, const API::GameError & x) {
        j = json::object();
        j["error"] = x.error;
        j["type"] = x.type;
    }

    inline void from_json(const json & j, API::Redirect& x) {
        x.room = j.at("room").get<std::string>();
        x.type = j.at("type").get<API::RedirectType>();
    }

    inline void to_json(json & j, const API::Redirect & x) {
        j = json::object();
        j["room"] = x.room;
        j["type"] = x.type;
    }

    inline void from_json(const json & j, API::RefetchPlayer& x) {
        x.type = j.at("type").get<API::RefetchPlayerType>();
        x.user_id = j.at("user_id").get<std::string>();
    }

    inline void to_json(json & j, const API::RefetchPlayer & x) {
        j = json::object();
        j["type"] = x.type;
        j["user_id"] = x.user_id;
    }

    inline void from_json(const json & j, API::Room& x) {
        x.code = j.at("code").get<std::string>();
        x.host_name = j.at("host_name").get<std::string>();
        x.last_updated = j.at("last_updated").get<std::string>();
        x.player_count = j.at("player_count").get<int64_t>();
    }

    inline void to_json(json & j, const API::Room & x) {
        j = json::object();
        j["code"] = x.code;
        j["host_name"] = x.host_name;
        j["last_updated"] = x.last_updated;
        j["player_count"] = x.player_count;
    }

    inline void from_json(const json & j, API::RoomList& x) {
        x.rooms = j.at("rooms").get<std::vector<API::Room>>();
    }

    inline void to_json(json & j, const API::RoomList & x) {
        j = json::object();
        j["rooms"] = x.rooms;
    }

    inline void from_json(const json & j, API::Player& x) {
        x.connected = j.at("connected").get<bool>();
        x.crowned = API::get_optional<bool>(j, "crowned");
        x.name = API::get_optional<std::string>(j, "name");
        x.score = j.at("score").get<int64_t>();
        x.user_id = API::get_optional<std::string>(j, "user_id");
        x.win_count = j.at("win_count").get<int64_t>();
    }

    inline void to_json(json & j, const API::Player & x) {
        j = json::object();
        j["connected"] = x.connected;
        j["crowned"] = x.crowned;
        j["name"] = x.name;
        j["score"] = x.score;
        j["user_id"] = x.user_id;
        j["win_count"] = x.win_count;
    }

    inline void from_json(const json & j, API::IGameState& x) {
        x.chat_log = j.at("chatLog").get<std::vector<std::string>>();
        x.players = j.at("players").get<std::vector<API::Player>>();
        x.private_session = j.at("privateSession").get<bool>();
        x.rolled = j.at("rolled").get<bool>();
        x.rolls = j.at("rolls").get<std::vector<double>>();
        x.turn_index = j.at("turn_index").get<int64_t>();
        x.used = j.at("used").get<std::vector<bool>>();
        x.victory = j.at("victory").get<bool>();
    }

    inline void to_json(json & j, const API::IGameState & x) {
        j = json::object();
        j["chatLog"] = x.chat_log;
        j["players"] = x.players;
        j["privateSession"] = x.private_session;
        j["rolled"] = x.rolled;
        j["rolls"] = x.rolls;
        j["turn_index"] = x.turn_index;
        j["used"] = x.used;
        j["victory"] = x.victory;
    }

    inline void from_json(const json & j, API::ServerPlayer& x) {
        x.connected = j.at("connected").get<bool>();
        x.crowned = API::get_optional<bool>(j, "crowned");
        x.doubles_count = j.at("doubles_count").get<int64_t>();
        x.name = API::get_optional<std::string>(j, "name");
        x.roll_count = j.at("roll_count").get<int64_t>();
        x.score = j.at("score").get<int64_t>();
        x.session = j.at("session").get<std::string>();
        x.skip_count = j.at("skip_count").get<int64_t>();
        x.turn_count = j.at("turn_count").get<int64_t>();
        x.user_id = API::get_optional<std::string>(j, "user_id");
        x.win_count = j.at("win_count").get<int64_t>();
    }

    inline void to_json(json & j, const API::ServerPlayer & x) {
        j = json::object();
        j["connected"] = x.connected;
        j["crowned"] = x.crowned;
        j["doubles_count"] = x.doubles_count;
        j["name"] = x.name;
        j["roll_count"] = x.roll_count;
        j["score"] = x.score;
        j["session"] = x.session;
        j["skip_count"] = x.skip_count;
        j["turn_count"] = x.turn_count;
        j["user_id"] = x.user_id;
        j["win_count"] = x.win_count;
    }

    inline void from_json(const json & j, API::GameState& x) {
        x.chat_log = j.at("chatLog").get<std::vector<std::string>>();
        x.players = j.at("players").get<std::vector<API::ServerPlayer>>();
        x.private_session = j.at("privateSession").get<bool>();
        x.rolled = j.at("rolled").get<bool>();
        x.rolls = j.at("rolls").get<std::vector<double>>();
        x.turn_index = j.at("turn_index").get<int64_t>();
        x.type = j.at("type").get<API::GameStateType>();
        x.used = j.at("used").get<std::vector<bool>>();
        x.victory = j.at("victory").get<bool>();
    }

    inline void to_json(json & j, const API::GameState & x) {
        j = json::object();
        j["chatLog"] = x.chat_log;
        j["players"] = x.players;
        j["privateSession"] = x.private_session;
        j["rolled"] = x.rolled;
        j["rolls"] = x.rolls;
        j["turn_index"] = x.turn_index;
        j["type"] = x.type;
        j["used"] = x.used;
        j["victory"] = x.victory;
    }

    inline void from_json(const json & j, API::WelcomeMsg& x) {
        x.chat_log = j.at("chatLog").get<std::vector<std::string>>();
        x.id = j.at("id").get<int64_t>();
        x.players = j.at("players").get<std::vector<API::Player>>();
        x.private_session = j.at("privateSession").get<bool>();
        x.rolled = j.at("rolled").get<bool>();
        x.rolls = j.at("rolls").get<std::vector<double>>();
        x.turn_index = j.at("turn_index").get<int64_t>();
        x.type = j.at("type").get<API::WelcomeMsgType>();
        x.used = j.at("used").get<std::vector<bool>>();
        x.victory = j.at("victory").get<bool>();
    }

    inline void to_json(json & j, const API::WelcomeMsg & x) {
        j = json::object();
        j["chatLog"] = x.chat_log;
        j["id"] = x.id;
        j["players"] = x.players;
        j["privateSession"] = x.private_session;
        j["rolled"] = x.rolled;
        j["rolls"] = x.rolls;
        j["turn_index"] = x.turn_index;
        j["type"] = x.type;
        j["used"] = x.used;
        j["victory"] = x.victory;
    }

    inline void from_json(const json & j, API::RestartMsg& x) {
        x.id = j.at("id").get<int64_t>();
        x.type = j.at("type").get<API::RestartMsgType>();
    }

    inline void to_json(json & j, const API::RestartMsg & x) {
        j = json::object();
        j["id"] = x.id;
        j["type"] = x.type;
    }

    inline void from_json(const json & j, API::WinMsg& x) {
        x.id = j.at("id").get<int64_t>();
        x.type = j.at("type").get<API::WinMsgType>();
    }

    inline void to_json(json & j, const API::WinMsg & x) {
        j = json::object();
        j["id"] = x.id;
        j["type"] = x.type;
    }

    inline void from_json(const json & j, API::RollMsg& x) {
        x.rolls = j.at("rolls").get<std::vector<double>>();
        x.type = j.at("type").get<API::RollMsgType>();
    }

    inline void to_json(json & j, const API::RollMsg & x) {
        j = json::object();
        j["rolls"] = x.rolls;
        j["type"] = x.type;
    }

    inline void from_json(const json & j, API::RollAgainMsg& x) {
        x.type = j.at("type").get<API::RollAgainMsgType>();
    }

    inline void to_json(json & j, const API::RollAgainMsg & x) {
        j = json::object();
        j["type"] = x.type;
    }

    inline void from_json(const json & j, API::JoinMsg& x) {
        x.id = j.at("id").get<int64_t>();
        x.name = API::get_optional<std::string>(j, "name");
        x.type = j.at("type").get<API::JoinMsgType>();
        x.user_id = API::get_optional<std::string>(j, "user_id");
    }

    inline void to_json(json & j, const API::JoinMsg & x) {
        j = json::object();
        j["id"] = x.id;
        j["name"] = x.name;
        j["type"] = x.type;
        j["user_id"] = x.user_id;
    }

    inline void from_json(const json & j, API::DisconnectMsg& x) {
        x.id = j.at("id").get<int64_t>();
        x.type = j.at("type").get<API::DisconnectMsgType>();
    }

    inline void to_json(json & j, const API::DisconnectMsg & x) {
        j = json::object();
        j["id"] = x.id;
        j["type"] = x.type;
    }

    inline void from_json(const json & j, API::ReconnectMsg& x) {
        x.id = j.at("id").get<int64_t>();
        x.name = API::get_optional<std::string>(j, "name");
        x.type = j.at("type").get<API::ReconnectMsgType>();
        x.user_id = API::get_optional<std::string>(j, "user_id");
    }

    inline void to_json(json & j, const API::ReconnectMsg & x) {
        j = json::object();
        j["id"] = x.id;
        j["name"] = x.name;
        j["type"] = x.type;
        j["user_id"] = x.user_id;
    }

    inline void from_json(const json & j, API::KickMsg& x) {
        x.id = j.at("id").get<int64_t>();
        x.type = j.at("type").get<API::KickMsgType>();
    }

    inline void to_json(json & j, const API::KickMsg & x) {
        j = json::object();
        j["id"] = x.id;
        j["type"] = x.type;
    }

    inline void from_json(const json & j, API::ChatMsg& x) {
        x.msg = j.at("msg").get<std::string>();
        x.type = j.at("type").get<API::ChatMsgType>();
    }

    inline void to_json(json & j, const API::ChatMsg & x) {
        j = json::object();
        j["msg"] = x.msg;
        j["type"] = x.type;
    }

    inline void from_json(const json & j, API::UpdateTurnMsg& x) {
        x.id = j.at("id").get<int64_t>();
        x.type = j.at("type").get<API::UpdateTurnMsgType>();
    }

    inline void to_json(json & j, const API::UpdateTurnMsg & x) {
        j = json::object();
        j["id"] = x.id;
        j["type"] = x.type;
    }

    inline void from_json(const json & j, API::UpdateNameMsg& x) {
        x.id = j.at("id").get<int64_t>();
        x.name = j.at("name").get<std::string>();
        x.type = j.at("type").get<API::UpdateNameMsgType>();
    }

    inline void to_json(json & j, const API::UpdateNameMsg & x) {
        j = json::object();
        j["id"] = x.id;
        j["name"] = x.name;
        j["type"] = x.type;
    }

    inline void from_json(const json & j, API::UpdateMsg& x) {
        x.id = j.at("id").get<int64_t>();
        x.reset = API::get_optional<bool>(j, "reset");
        x.score = j.at("score").get<int64_t>();
        x.type = j.at("type").get<API::UpdateMsgType>();
        x.used = API::get_optional<std::vector<bool>>(j, "used");
    }

    inline void to_json(json & j, const API::UpdateMsg & x) {
        j = json::object();
        j["id"] = x.id;
        j["reset"] = x.reset;
        j["score"] = x.score;
        j["type"] = x.type;
        j["used"] = x.used;
    }

    inline void from_json(const json & j, API::UserIdType & x) {
        if (j == "Anonymous") x = API::UserIdType::ANONYMOUS;
        else if (j == "User") x = API::UserIdType::USER;
        else throw "Input JSON does not conform to schema";
    }

    inline void to_json(json & j, const API::UserIdType & x) {
        switch (x) {
            case API::UserIdType::ANONYMOUS: j = "Anonymous"; break;
            case API::UserIdType::USER: j = "User"; break;
            default: throw "This should not happen";
        }
    }

    inline void from_json(const json & j, API::AchievementProgressType & x) {
        if (j == "achievement_progress") x = API::AchievementProgressType::ACHIEVEMENT_PROGRESS;
        else throw "Input JSON does not conform to schema";
    }

    inline void to_json(json & j, const API::AchievementProgressType & x) {
        switch (x) {
            case API::AchievementProgressType::ACHIEVEMENT_PROGRESS: j = "achievement_progress"; break;
            default: throw "This should not happen";
        }
    }

    inline void from_json(const json & j, API::AchievementUnlockType & x) {
        if (j == "achievement_unlock") x = API::AchievementUnlockType::ACHIEVEMENT_UNLOCK;
        else throw "Input JSON does not conform to schema";
    }

    inline void to_json(json & j, const API::AchievementUnlockType & x) {
        switch (x) {
            case API::AchievementUnlockType::ACHIEVEMENT_UNLOCK: j = "achievement_unlock"; break;
            default: throw "This should not happen";
        }
    }

    inline void from_json(const json & j, API::GameErrorType & x) {
        if (j == "error") x = API::GameErrorType::ERROR;
        else throw "Input JSON does not conform to schema";
    }

    inline void to_json(json & j, const API::GameErrorType & x) {
        switch (x) {
            case API::GameErrorType::ERROR: j = "error"; break;
            default: throw "This should not happen";
        }
    }

    inline void from_json(const json & j, API::RedirectType & x) {
        if (j == "redirect") x = API::RedirectType::REDIRECT;
        else throw "Input JSON does not conform to schema";
    }

    inline void to_json(json & j, const API::RedirectType & x) {
        switch (x) {
            case API::RedirectType::REDIRECT: j = "redirect"; break;
            default: throw "This should not happen";
        }
    }

    inline void from_json(const json & j, API::RefetchPlayerType & x) {
        if (j == "refetch_player") x = API::RefetchPlayerType::REFETCH_PLAYER;
        else throw "Input JSON does not conform to schema";
    }

    inline void to_json(json & j, const API::RefetchPlayerType & x) {
        switch (x) {
            case API::RefetchPlayerType::REFETCH_PLAYER: j = "refetch_player"; break;
            default: throw "This should not happen";
        }
    }

    inline void from_json(const json & j, API::GameStateType & x) {
        if (j == "game_state") x = API::GameStateType::GAME_STATE;
        else throw "Input JSON does not conform to schema";
    }

    inline void to_json(json & j, const API::GameStateType & x) {
        switch (x) {
            case API::GameStateType::GAME_STATE: j = "game_state"; break;
            default: throw "This should not happen";
        }
    }

    inline void from_json(const json & j, API::WelcomeMsgType & x) {
        if (j == "welcome") x = API::WelcomeMsgType::WELCOME;
        else throw "Input JSON does not conform to schema";
    }

    inline void to_json(json & j, const API::WelcomeMsgType & x) {
        switch (x) {
            case API::WelcomeMsgType::WELCOME: j = "welcome"; break;
            default: throw "This should not happen";
        }
    }

    inline void from_json(const json & j, API::RestartMsgType & x) {
        if (j == "restart") x = API::RestartMsgType::RESTART;
        else throw "Input JSON does not conform to schema";
    }

    inline void to_json(json & j, const API::RestartMsgType & x) {
        switch (x) {
            case API::RestartMsgType::RESTART: j = "restart"; break;
            default: throw "This should not happen";
        }
    }

    inline void from_json(const json & j, API::WinMsgType & x) {
        if (j == "win") x = API::WinMsgType::WIN;
        else throw "Input JSON does not conform to schema";
    }

    inline void to_json(json & j, const API::WinMsgType & x) {
        switch (x) {
            case API::WinMsgType::WIN: j = "win"; break;
            default: throw "This should not happen";
        }
    }

    inline void from_json(const json & j, API::RollMsgType & x) {
        if (j == "roll") x = API::RollMsgType::ROLL;
        else throw "Input JSON does not conform to schema";
    }

    inline void to_json(json & j, const API::RollMsgType & x) {
        switch (x) {
            case API::RollMsgType::ROLL: j = "roll"; break;
            default: throw "This should not happen";
        }
    }

    inline void from_json(const json & j, API::RollAgainMsgType & x) {
        if (j == "roll_again") x = API::RollAgainMsgType::ROLL_AGAIN;
        else throw "Input JSON does not conform to schema";
    }

    inline void to_json(json & j, const API::RollAgainMsgType & x) {
        switch (x) {
            case API::RollAgainMsgType::ROLL_AGAIN: j = "roll_again"; break;
            default: throw "This should not happen";
        }
    }

    inline void from_json(const json & j, API::JoinMsgType & x) {
        if (j == "join") x = API::JoinMsgType::JOIN;
        else throw "Input JSON does not conform to schema";
    }

    inline void to_json(json & j, const API::JoinMsgType & x) {
        switch (x) {
            case API::JoinMsgType::JOIN: j = "join"; break;
            default: throw "This should not happen";
        }
    }

    inline void from_json(const json & j, API::DisconnectMsgType & x) {
        if (j == "disconnect") x = API::DisconnectMsgType::DISCONNECT;
        else throw "Input JSON does not conform to schema";
    }

    inline void to_json(json & j, const API::DisconnectMsgType & x) {
        switch (x) {
            case API::DisconnectMsgType::DISCONNECT: j = "disconnect"; break;
            default: throw "This should not happen";
        }
    }

    inline void from_json(const json & j, API::ReconnectMsgType & x) {
        if (j == "reconnect") x = API::ReconnectMsgType::RECONNECT;
        else throw "Input JSON does not conform to schema";
    }

    inline void to_json(json & j, const API::ReconnectMsgType & x) {
        switch (x) {
            case API::ReconnectMsgType::RECONNECT: j = "reconnect"; break;
            default: throw "This should not happen";
        }
    }

    inline void from_json(const json & j, API::KickMsgType & x) {
        if (j == "kick") x = API::KickMsgType::KICK;
        else throw "Input JSON does not conform to schema";
    }

    inline void to_json(json & j, const API::KickMsgType & x) {
        switch (x) {
            case API::KickMsgType::KICK: j = "kick"; break;
            default: throw "This should not happen";
        }
    }

    inline void from_json(const json & j, API::ChatMsgType & x) {
        if (j == "chat") x = API::ChatMsgType::CHAT;
        else throw "Input JSON does not conform to schema";
    }

    inline void to_json(json & j, const API::ChatMsgType & x) {
        switch (x) {
            case API::ChatMsgType::CHAT: j = "chat"; break;
            default: throw "This should not happen";
        }
    }

    inline void from_json(const json & j, API::UpdateTurnMsgType & x) {
        if (j == "update_turn") x = API::UpdateTurnMsgType::UPDATE_TURN;
        else throw "Input JSON does not conform to schema";
    }

    inline void to_json(json & j, const API::UpdateTurnMsgType & x) {
        switch (x) {
            case API::UpdateTurnMsgType::UPDATE_TURN: j = "update_turn"; break;
            default: throw "This should not happen";
        }
    }

    inline void from_json(const json & j, API::UpdateNameMsgType & x) {
        if (j == "update_name") x = API::UpdateNameMsgType::UPDATE_NAME;
        else throw "Input JSON does not conform to schema";
    }

    inline void to_json(json & j, const API::UpdateNameMsgType & x) {
        switch (x) {
            case API::UpdateNameMsgType::UPDATE_NAME: j = "update_name"; break;
            default: throw "This should not happen";
        }
    }

    inline void from_json(const json & j, API::UpdateMsgType & x) {
        if (j == "update") x = API::UpdateMsgType::UPDATE;
        else throw "Input JSON does not conform to schema";
    }

    inline void to_json(json & j, const API::UpdateMsgType & x) {
        switch (x) {
            case API::UpdateMsgType::UPDATE: j = "update"; break;
            default: throw "This should not happen";
        }
    }
}
namespace API {
std::string AchievementData::toString() const {
json j;
to_json(j, *this);
return j.dump();
}
void AchievementData::fromString(const std::string &s) {
auto j = json::parse(s);
from_json(j, *this);
}
std::string Achievement::toString() const {
json j;
to_json(j, *this);
return j.dump();
}
void Achievement::fromString(const std::string &s) {
auto j = json::parse(s);
from_json(j, *this);
}
std::string AchievementProgress::toString() const {
json j;
to_json(j, *this);
return j.dump();
}
void AchievementProgress::fromString(const std::string &s) {
auto j = json::parse(s);
from_json(j, *this);
}
std::string AchievementProgressUserId::toString() const {
json j;
to_json(j, *this);
return j.dump();
}
void AchievementProgressUserId::fromString(const std::string &s) {
auto j = json::parse(s);
from_json(j, *this);
}
std::string AchievementUnlock::toString() const {
json j;
to_json(j, *this);
return j.dump();
}
void AchievementUnlock::fromString(const std::string &s) {
auto j = json::parse(s);
from_json(j, *this);
}
std::string ChatMsg::toString() const {
json j;
to_json(j, *this);
return j.dump();
}
void ChatMsg::fromString(const std::string &s) {
auto j = json::parse(s);
from_json(j, *this);
}
std::string Color::toString() const {
json j;
to_json(j, *this);
return j.dump();
}
void Color::fromString(const std::string &s) {
auto j = json::parse(s);
from_json(j, *this);
}
std::string Dice::toString() const {
json j;
to_json(j, *this);
return j.dump();
}
void Dice::fromString(const std::string &s) {
auto j = json::parse(s);
from_json(j, *this);
}
std::string DieRoll::toString() const {
json j;
to_json(j, *this);
return j.dump();
}
void DieRoll::fromString(const std::string &s) {
auto j = json::parse(s);
from_json(j, *this);
}
std::string DisconnectMsg::toString() const {
json j;
to_json(j, *this);
return j.dump();
}
void DisconnectMsg::fromString(const std::string &s) {
auto j = json::parse(s);
from_json(j, *this);
}
std::string GameError::toString() const {
json j;
to_json(j, *this);
return j.dump();
}
void GameError::fromString(const std::string &s) {
auto j = json::parse(s);
from_json(j, *this);
}
std::string GameState::toString() const {
json j;
to_json(j, *this);
return j.dump();
}
void GameState::fromString(const std::string &s) {
auto j = json::parse(s);
from_json(j, *this);
}
std::string IGameState::toString() const {
json j;
to_json(j, *this);
return j.dump();
}
void IGameState::fromString(const std::string &s) {
auto j = json::parse(s);
from_json(j, *this);
}
std::string JoinMsg::toString() const {
json j;
to_json(j, *this);
return j.dump();
}
void JoinMsg::fromString(const std::string &s) {
auto j = json::parse(s);
from_json(j, *this);
}
std::string KickMsg::toString() const {
json j;
to_json(j, *this);
return j.dump();
}
void KickMsg::fromString(const std::string &s) {
auto j = json::parse(s);
from_json(j, *this);
}
std::string Player::toString() const {
json j;
to_json(j, *this);
return j.dump();
}
void Player::fromString(const std::string &s) {
auto j = json::parse(s);
from_json(j, *this);
}
std::string ReconnectMsg::toString() const {
json j;
to_json(j, *this);
return j.dump();
}
void ReconnectMsg::fromString(const std::string &s) {
auto j = json::parse(s);
from_json(j, *this);
}
std::string Redirect::toString() const {
json j;
to_json(j, *this);
return j.dump();
}
void Redirect::fromString(const std::string &s) {
auto j = json::parse(s);
from_json(j, *this);
}
std::string RefetchPlayer::toString() const {
json j;
to_json(j, *this);
return j.dump();
}
void RefetchPlayer::fromString(const std::string &s) {
auto j = json::parse(s);
from_json(j, *this);
}
std::string ReportStats::toString() const {
json j;
to_json(j, *this);
return j.dump();
}
void ReportStats::fromString(const std::string &s) {
auto j = json::parse(s);
from_json(j, *this);
}
std::string ReportStatsUserId::toString() const {
json j;
to_json(j, *this);
return j.dump();
}
void ReportStatsUserId::fromString(const std::string &s) {
auto j = json::parse(s);
from_json(j, *this);
}
std::string RestartMsg::toString() const {
json j;
to_json(j, *this);
return j.dump();
}
void RestartMsg::fromString(const std::string &s) {
auto j = json::parse(s);
from_json(j, *this);
}
std::string RollAgainMsg::toString() const {
json j;
to_json(j, *this);
return j.dump();
}
void RollAgainMsg::fromString(const std::string &s) {
auto j = json::parse(s);
from_json(j, *this);
}
std::string RollMsg::toString() const {
json j;
to_json(j, *this);
return j.dump();
}
void RollMsg::fromString(const std::string &s) {
auto j = json::parse(s);
from_json(j, *this);
}
std::string Room::toString() const {
json j;
to_json(j, *this);
return j.dump();
}
void Room::fromString(const std::string &s) {
auto j = json::parse(s);
from_json(j, *this);
}
std::string RoomList::toString() const {
json j;
to_json(j, *this);
return j.dump();
}
void RoomList::fromString(const std::string &s) {
auto j = json::parse(s);
from_json(j, *this);
}
std::string ServerPlayer::toString() const {
json j;
to_json(j, *this);
return j.dump();
}
void ServerPlayer::fromString(const std::string &s) {
auto j = json::parse(s);
from_json(j, *this);
}
std::string UpdateMsg::toString() const {
json j;
to_json(j, *this);
return j.dump();
}
void UpdateMsg::fromString(const std::string &s) {
auto j = json::parse(s);
from_json(j, *this);
}
std::string UpdateNameMsg::toString() const {
json j;
to_json(j, *this);
return j.dump();
}
void UpdateNameMsg::fromString(const std::string &s) {
auto j = json::parse(s);
from_json(j, *this);
}
std::string UpdateTurnMsg::toString() const {
json j;
to_json(j, *this);
return j.dump();
}
void UpdateTurnMsg::fromString(const std::string &s) {
auto j = json::parse(s);
from_json(j, *this);
}
std::string UserData::toString() const {
json j;
to_json(j, *this);
return j.dump();
}
void UserData::fromString(const std::string &s) {
auto j = json::parse(s);
from_json(j, *this);
}
std::string UserId::toString() const {
json j;
to_json(j, *this);
return j.dump();
}
void UserId::fromString(const std::string &s) {
auto j = json::parse(s);
from_json(j, *this);
}
std::string UserStats::toString() const {
json j;
to_json(j, *this);
return j.dump();
}
void UserStats::fromString(const std::string &s) {
auto j = json::parse(s);
from_json(j, *this);
}
std::string WelcomeMsg::toString() const {
json j;
to_json(j, *this);
return j.dump();
}
void WelcomeMsg::fromString(const std::string &s) {
auto j = json::parse(s);
from_json(j, *this);
}
std::string WinMsg::toString() const {
json j;
to_json(j, *this);
return j.dump();
}
void WinMsg::fromString(const std::string &s) {
auto j = json::parse(s);
from_json(j, *this);
}
}
