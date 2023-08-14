#include <optional>
#include "json.hpp"
#include "helper.hpp"
#include "API.hpp"




namespace API {
    void from_json(const json & j, UserId & x);
    void to_json(json & j, const UserId & x);

    void from_json(const json & j, AchievementProgress & x);
    void to_json(json & j, const AchievementProgress & x);

    void from_json(const json & j, AchievementUnlock & x);
    void to_json(json & j, const AchievementUnlock & x);

    void from_json(const json & j, ReportStats & x);
    void to_json(json & j, const ReportStats & x);

    void from_json(const json & j, AchievementData & x);
    void to_json(json & j, const AchievementData & x);

    void from_json(const json & j, Achievement & x);
    void to_json(json & j, const Achievement & x);

    void from_json(const json & j, Color & x);
    void to_json(json & j, const Color & x);

    void from_json(const json & j, Dice & x);
    void to_json(json & j, const Dice & x);

    void from_json(const json & j, UserStats & x);
    void to_json(json & j, const UserStats & x);

    void from_json(const json & j, UserData & x);
    void to_json(json & j, const UserData & x);

    void from_json(const json & j, DieRoll & x);
    void to_json(json & j, const DieRoll & x);

    void from_json(const json & j, GameError & x);
    void to_json(json & j, const GameError & x);

    void from_json(const json & j, Redirect & x);
    void to_json(json & j, const Redirect & x);

    void from_json(const json & j, RefetchPlayerMsg & x);
    void to_json(json & j, const RefetchPlayerMsg & x);

    void from_json(const json & j, Room & x);
    void to_json(json & j, const Room & x);

    void from_json(const json & j, RoomListMsg & x);
    void to_json(json & j, const RoomListMsg & x);

    void from_json(const json & j, Player & x);
    void to_json(json & j, const Player & x);

    void from_json(const json & j, IGameState & x);
    void to_json(json & j, const IGameState & x);

    void from_json(const json & j, ServerPlayer & x);
    void to_json(json & j, const ServerPlayer & x);

    void from_json(const json & j, GameState & x);
    void to_json(json & j, const GameState & x);

    void from_json(const json & j, WelcomeMsg & x);
    void to_json(json & j, const WelcomeMsg & x);

    void from_json(const json & j, RestartMsg & x);
    void to_json(json & j, const RestartMsg & x);

    void from_json(const json & j, SpectatorsMsg & x);
    void to_json(json & j, const SpectatorsMsg & x);

    void from_json(const json & j, WinMsg & x);
    void to_json(json & j, const WinMsg & x);

    void from_json(const json & j, RollMsg & x);
    void to_json(json & j, const RollMsg & x);

    void from_json(const json & j, RollAgainMsg & x);
    void to_json(json & j, const RollAgainMsg & x);

    void from_json(const json & j, JoinMsg & x);
    void to_json(json & j, const JoinMsg & x);

    void from_json(const json & j, DisconnectMsg & x);
    void to_json(json & j, const DisconnectMsg & x);

    void from_json(const json & j, ReconnectMsg & x);
    void to_json(json & j, const ReconnectMsg & x);

    void from_json(const json & j, KickMsg & x);
    void to_json(json & j, const KickMsg & x);

    void from_json(const json & j, ChatMsg & x);
    void to_json(json & j, const ChatMsg & x);

    void from_json(const json & j, UpdateTurnMsg & x);
    void to_json(json & j, const UpdateTurnMsg & x);

    void from_json(const json & j, UpdateNameMsg & x);
    void to_json(json & j, const UpdateNameMsg & x);

    void from_json(const json & j, UpdateMsg & x);
    void to_json(json & j, const UpdateMsg & x);

    void from_json(const json & j, AchievementProgressType & x);
    void to_json(json & j, const AchievementProgressType & x);

    void from_json(const json & j, UserIdType & x);
    void to_json(json & j, const UserIdType & x);

    void from_json(const json & j, AchievementUnlockType & x);
    void to_json(json & j, const AchievementUnlockType & x);

    void from_json(const json & j, DiceType & x);
    void to_json(json & j, const DiceType & x);

    void from_json(const json & j, GameErrorType & x);
    void to_json(json & j, const GameErrorType & x);

    void from_json(const json & j, RedirectType & x);
    void to_json(json & j, const RedirectType & x);

    void from_json(const json & j, RefetchPlayerMsgType & x);
    void to_json(json & j, const RefetchPlayerMsgType & x);

    void from_json(const json & j, RoomListMsgType & x);
    void to_json(json & j, const RoomListMsgType & x);

    void from_json(const json & j, GameStateType & x);
    void to_json(json & j, const GameStateType & x);

    void from_json(const json & j, WelcomeMsgType & x);
    void to_json(json & j, const WelcomeMsgType & x);

    void from_json(const json & j, RestartMsgType & x);
    void to_json(json & j, const RestartMsgType & x);

    void from_json(const json & j, SpectatorsMsgType & x);
    void to_json(json & j, const SpectatorsMsgType & x);

    void from_json(const json & j, WinMsgType & x);
    void to_json(json & j, const WinMsgType & x);

    void from_json(const json & j, RollMsgType & x);
    void to_json(json & j, const RollMsgType & x);

    void from_json(const json & j, RollAgainMsgType & x);
    void to_json(json & j, const RollAgainMsgType & x);

    void from_json(const json & j, JoinMsgType & x);
    void to_json(json & j, const JoinMsgType & x);

    void from_json(const json & j, DisconnectMsgType & x);
    void to_json(json & j, const DisconnectMsgType & x);

    void from_json(const json & j, ReconnectMsgType & x);
    void to_json(json & j, const ReconnectMsgType & x);

    void from_json(const json & j, KickMsgType & x);
    void to_json(json & j, const KickMsgType & x);

    void from_json(const json & j, ChatMsgType & x);
    void to_json(json & j, const ChatMsgType & x);

    void from_json(const json & j, UpdateTurnMsgType & x);
    void to_json(json & j, const UpdateTurnMsgType & x);

    void from_json(const json & j, UpdateNameMsgType & x);
    void to_json(json & j, const UpdateNameMsgType & x);

    void from_json(const json & j, UpdateMsgType & x);
    void to_json(json & j, const UpdateMsgType & x);

    inline void from_json(const json & j, UserId& x) {
        x.id = j.at("id").get<std::string>();
        x.type = j.at("type").get<UserIdType>();
    }

    inline void to_json(json & j, const UserId & x) {
        j = json::object();
        j["id"] = x.id;
        j["type"] = x.type;
    }

    inline void from_json(const json & j, AchievementProgress& x) {
        x.achievement_id = j.at("achievement_id").get<std::string>();
        x.progress = j.at("progress").get<int64_t>();
        x.type = j.at("type").get<AchievementProgressType>();
        x.user_id = j.at("user_id").get<UserId>();
        x.user_index = j.at("user_index").get<int64_t>();
    }

    inline void to_json(json & j, const AchievementProgress & x) {
        j = json::object();
        j["achievement_id"] = x.achievement_id;
        j["progress"] = x.progress;
        j["type"] = x.type;
        j["user_id"] = x.user_id;
        j["user_index"] = x.user_index;
    }

    inline void from_json(const json & j, AchievementUnlock& x) {
        x.description = j.at("description").get<std::string>();
        x.id = j.at("id").get<std::string>();
        x.image_url = get_stack_optional<std::string>(j, "image_url");
        x.max_progress = j.at("max_progress").get<int64_t>();
        x.name = j.at("name").get<std::string>();
        x.type = j.at("type").get<AchievementUnlockType>();
        x.user_id = j.at("user_id").get<std::string>();
        x.user_index = j.at("user_index").get<int64_t>();
    }

    inline void to_json(json & j, const AchievementUnlock & x) {
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

    inline void from_json(const json & j, ReportStats& x) {
        x.doubles = j.at("doubles").get<int64_t>();
        x.games = j.at("games").get<int64_t>();
        x.rolls = j.at("rolls").get<int64_t>();
        x.user_id = j.at("user_id").get<UserId>();
        x.wins = j.at("wins").get<int64_t>();
    }

    inline void to_json(json & j, const ReportStats & x) {
        j = json::object();
        j["doubles"] = x.doubles;
        j["games"] = x.games;
        j["rolls"] = x.rolls;
        j["user_id"] = x.user_id;
        j["wins"] = x.wins;
    }

    inline void from_json(const json & j, AchievementData& x) {
        x.description = j.at("description").get<std::string>();
        x.id = j.at("id").get<std::string>();
        x.image_url = get_stack_optional<std::string>(j, "image_url");
        x.max_progress = j.at("max_progress").get<int64_t>();
        x.name = j.at("name").get<std::string>();
    }

    inline void to_json(json & j, const AchievementData & x) {
        j = json::object();
        j["description"] = x.description;
        j["id"] = x.id;
        j["image_url"] = x.image_url;
        j["max_progress"] = x.max_progress;
        j["name"] = x.name;
    }

    inline void from_json(const json & j, Achievement& x) {
        x.id = j.at("id").get<std::string>();
        x.progress = j.at("progress").get<int64_t>();
        x.rd = get_stack_optional<int64_t>(j, "rd");
        x.rn = get_stack_optional<int64_t>(j, "rn");
        x.unlocked = j.at("unlocked").get<std::string>();
    }

    inline void to_json(json & j, const Achievement & x) {
        j = json::object();
        j["id"] = x.id;
        j["progress"] = x.progress;
        j["rd"] = x.rd;
        j["rn"] = x.rn;
        j["unlocked"] = x.unlocked;
    }

    inline void from_json(const json & j, Color& x) {
        x.hue = j.at("hue").get<double>();
        x.sat = j.at("sat").get<double>();
    }

    inline void to_json(json & j, const Color & x) {
        j = json::object();
        j["hue"] = x.hue;
        j["sat"] = x.sat;
    }

    inline void from_json(const json & j, Dice& x) {
        x.type = j.at("type").get<DiceType>();
    }

    inline void to_json(json & j, const Dice & x) {
        j = json::object();
        j["type"] = x.type;
    }

    inline void from_json(const json & j, UserStats& x) {
        x.doubles = j.at("doubles").get<int64_t>();
        x.games = j.at("games").get<int64_t>();
        x.rolls = j.at("rolls").get<int64_t>();
        x.wins = j.at("wins").get<int64_t>();
    }

    inline void to_json(json & j, const UserStats & x) {
        j = json::object();
        j["doubles"] = x.doubles;
        j["games"] = x.games;
        j["rolls"] = x.rolls;
        j["wins"] = x.wins;
    }

    inline void from_json(const json & j, UserData& x) {
        x.achievements = get_stack_optional<std::vector<Achievement>>(j, "achievements");
        x.color = j.at("color").get<Color>();
        x.created_date = j.at("createdDate").get<std::string>();
        x.dice = j.at("dice").get<Dice>();
        x.donor = j.at("donor").get<bool>();
        x.id = j.at("id").get<std::string>();
        x.image_url = get_stack_optional<std::string>(j, "image_url");
        x.pubkey_text = get_stack_optional<std::string>(j, "pubkey_text");
        x.stats = get_stack_optional<UserStats>(j, "stats");
        x.username = j.at("username").get<std::string>();
    }

    inline void to_json(json & j, const UserData & x) {
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

    inline void from_json(const json & j, DieRoll& x) {
        x.used = j.at("used").get<bool>();
        x.value = j.at("value").get<int64_t>();
    }

    inline void to_json(json & j, const DieRoll & x) {
        j = json::object();
        j["used"] = x.used;
        j["value"] = x.value;
    }

    inline void from_json(const json & j, GameError& x) {
        x.error = j.at("error").get<std::string>();
        x.type = j.at("type").get<GameErrorType>();
    }

    inline void to_json(json & j, const GameError & x) {
        j = json::object();
        j["error"] = x.error;
        j["type"] = x.type;
    }

    inline void from_json(const json & j, Redirect& x) {
        x.room = j.at("room").get<std::string>();
        x.type = j.at("type").get<RedirectType>();
    }

    inline void to_json(json & j, const Redirect & x) {
        j = json::object();
        j["room"] = x.room;
        j["type"] = x.type;
    }

    inline void from_json(const json & j, RefetchPlayerMsg& x) {
        x.type = j.at("type").get<RefetchPlayerMsgType>();
        x.user_id = j.at("user_id").get<std::string>();
    }

    inline void to_json(json & j, const RefetchPlayerMsg & x) {
        j = json::object();
        j["type"] = x.type;
        j["user_id"] = x.user_id;
    }

    inline void from_json(const json & j, Room& x) {
        x.code = j.at("code").get<std::string>();
        x.host_name = j.at("host_name").get<std::string>();
        x.last_updated = j.at("last_updated").get<std::string>();
        x.player_count = j.at("player_count").get<int64_t>();
    }

    inline void to_json(json & j, const Room & x) {
        j = json::object();
        j["code"] = x.code;
        j["host_name"] = x.host_name;
        j["last_updated"] = x.last_updated;
        j["player_count"] = x.player_count;
    }

    inline void from_json(const json & j, RoomListMsg& x) {
        x.rooms = j.at("rooms").get<std::vector<Room>>();
        x.type = get_stack_optional<RoomListMsgType>(j, "type");
    }

    inline void to_json(json & j, const RoomListMsg & x) {
        j = json::object();
        j["rooms"] = x.rooms;
        j["type"] = x.type;
    }

    inline void from_json(const json & j, Player& x) {
        x.connected = j.at("connected").get<bool>();
        x.crowned = get_stack_optional<bool>(j, "crowned");
        x.name = get_stack_optional<std::string>(j, "name");
        x.score = j.at("score").get<int64_t>();
        x.skip_count = j.at("skip_count").get<int64_t>();
        x.user_id = get_stack_optional<std::string>(j, "user_id");
        x.win_count = j.at("win_count").get<int64_t>();
    }

    inline void to_json(json & j, const Player & x) {
        j = json::object();
        j["connected"] = x.connected;
        j["crowned"] = x.crowned;
        j["name"] = x.name;
        j["score"] = x.score;
        j["skip_count"] = x.skip_count;
        j["user_id"] = x.user_id;
        j["win_count"] = x.win_count;
    }

    inline void from_json(const json & j, IGameState& x) {
        x.chat_log = j.at("chatLog").get<std::vector<std::string>>();
        x.players = j.at("players").get<std::vector<Player>>();
        x.private_session = j.at("privateSession").get<bool>();
        x.rolled = j.at("rolled").get<bool>();
        x.rolls = j.at("rolls").get<std::vector<int64_t>>();
        x.spectators = j.at("spectators").get<int64_t>();
        x.turn_index = j.at("turn_index").get<int64_t>();
        x.used = j.at("used").get<std::vector<bool>>();
        x.victory = j.at("victory").get<bool>();
    }

    inline void to_json(json & j, const IGameState & x) {
        j = json::object();
        j["chatLog"] = x.chat_log;
        j["players"] = x.players;
        j["privateSession"] = x.private_session;
        j["rolled"] = x.rolled;
        j["rolls"] = x.rolls;
        j["spectators"] = x.spectators;
        j["turn_index"] = x.turn_index;
        j["used"] = x.used;
        j["victory"] = x.victory;
    }

    inline void from_json(const json & j, ServerPlayer& x) {
        x.connected = j.at("connected").get<bool>();
        x.crowned = get_stack_optional<bool>(j, "crowned");
        x.doubles_count = j.at("doubles_count").get<int64_t>();
        x.name = get_stack_optional<std::string>(j, "name");
        x.roll_count = j.at("roll_count").get<int64_t>();
        x.score = j.at("score").get<int64_t>();
        x.session = j.at("session").get<std::string>();
        x.skip_count = j.at("skip_count").get<int64_t>();
        x.turn_count = j.at("turn_count").get<int64_t>();
        x.user_id = get_stack_optional<std::string>(j, "user_id");
        x.win_count = j.at("win_count").get<int64_t>();
    }

    inline void to_json(json & j, const ServerPlayer & x) {
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

    inline void from_json(const json & j, GameState& x) {
        x.chat_log = j.at("chatLog").get<std::vector<std::string>>();
        x.players = j.at("players").get<std::vector<ServerPlayer>>();
        x.private_session = j.at("privateSession").get<bool>();
        x.rolled = j.at("rolled").get<bool>();
        x.rolls = j.at("rolls").get<std::vector<int64_t>>();
        x.spectators = j.at("spectators").get<int64_t>();
        x.turn_index = j.at("turn_index").get<int64_t>();
        x.type = j.at("type").get<GameStateType>();
        x.used = j.at("used").get<std::vector<bool>>();
        x.victory = j.at("victory").get<bool>();
    }

    inline void to_json(json & j, const GameState & x) {
        j = json::object();
        j["chatLog"] = x.chat_log;
        j["players"] = x.players;
        j["privateSession"] = x.private_session;
        j["rolled"] = x.rolled;
        j["rolls"] = x.rolls;
        j["spectators"] = x.spectators;
        j["turn_index"] = x.turn_index;
        j["type"] = x.type;
        j["used"] = x.used;
        j["victory"] = x.victory;
    }

    inline void from_json(const json & j, WelcomeMsg& x) {
        x.chat_log = j.at("chatLog").get<std::vector<std::string>>();
        x.id = j.at("id").get<int64_t>();
        x.players = j.at("players").get<std::vector<Player>>();
        x.private_session = j.at("privateSession").get<bool>();
        x.rolled = j.at("rolled").get<bool>();
        x.rolls = j.at("rolls").get<std::vector<int64_t>>();
        x.spectators = j.at("spectators").get<int64_t>();
        x.turn_index = j.at("turn_index").get<int64_t>();
        x.type = j.at("type").get<WelcomeMsgType>();
        x.used = j.at("used").get<std::vector<bool>>();
        x.victory = j.at("victory").get<bool>();
    }

    inline void to_json(json & j, const WelcomeMsg & x) {
        j = json::object();
        j["chatLog"] = x.chat_log;
        j["id"] = x.id;
        j["players"] = x.players;
        j["privateSession"] = x.private_session;
        j["rolled"] = x.rolled;
        j["rolls"] = x.rolls;
        j["spectators"] = x.spectators;
        j["turn_index"] = x.turn_index;
        j["type"] = x.type;
        j["used"] = x.used;
        j["victory"] = x.victory;
    }

    inline void from_json(const json & j, RestartMsg& x) {
        x.id = j.at("id").get<int64_t>();
        x.type = j.at("type").get<RestartMsgType>();
    }

    inline void to_json(json & j, const RestartMsg & x) {
        j = json::object();
        j["id"] = x.id;
        j["type"] = x.type;
    }

    inline void from_json(const json & j, SpectatorsMsg& x) {
        x.count = j.at("count").get<int64_t>();
        x.type = j.at("type").get<SpectatorsMsgType>();
    }

    inline void to_json(json & j, const SpectatorsMsg & x) {
        j = json::object();
        j["count"] = x.count;
        j["type"] = x.type;
    }

    inline void from_json(const json & j, WinMsg& x) {
        x.id = j.at("id").get<int64_t>();
        x.type = j.at("type").get<WinMsgType>();
    }

    inline void to_json(json & j, const WinMsg & x) {
        j = json::object();
        j["id"] = x.id;
        j["type"] = x.type;
    }

    inline void from_json(const json & j, RollMsg& x) {
        x.rolls = j.at("rolls").get<std::vector<int64_t>>();
        x.type = j.at("type").get<RollMsgType>();
    }

    inline void to_json(json & j, const RollMsg & x) {
        j = json::object();
        j["rolls"] = x.rolls;
        j["type"] = x.type;
    }

    inline void from_json(const json & j, RollAgainMsg& x) {
        x.type = j.at("type").get<RollAgainMsgType>();
    }

    inline void to_json(json & j, const RollAgainMsg & x) {
        j = json::object();
        j["type"] = x.type;
    }

    inline void from_json(const json & j, JoinMsg& x) {
        x.id = j.at("id").get<int64_t>();
        x.name = get_stack_optional<std::string>(j, "name");
        x.type = j.at("type").get<JoinMsgType>();
        x.user_id = get_stack_optional<std::string>(j, "user_id");
    }

    inline void to_json(json & j, const JoinMsg & x) {
        j = json::object();
        j["id"] = x.id;
        j["name"] = x.name;
        j["type"] = x.type;
        j["user_id"] = x.user_id;
    }

    inline void from_json(const json & j, DisconnectMsg& x) {
        x.id = j.at("id").get<int64_t>();
        x.type = j.at("type").get<DisconnectMsgType>();
    }

    inline void to_json(json & j, const DisconnectMsg & x) {
        j = json::object();
        j["id"] = x.id;
        j["type"] = x.type;
    }

    inline void from_json(const json & j, ReconnectMsg& x) {
        x.id = j.at("id").get<int64_t>();
        x.name = get_stack_optional<std::string>(j, "name");
        x.type = j.at("type").get<ReconnectMsgType>();
        x.user_id = get_stack_optional<std::string>(j, "user_id");
    }

    inline void to_json(json & j, const ReconnectMsg & x) {
        j = json::object();
        j["id"] = x.id;
        j["name"] = x.name;
        j["type"] = x.type;
        j["user_id"] = x.user_id;
    }

    inline void from_json(const json & j, KickMsg& x) {
        x.id = j.at("id").get<int64_t>();
        x.type = j.at("type").get<KickMsgType>();
    }

    inline void to_json(json & j, const KickMsg & x) {
        j = json::object();
        j["id"] = x.id;
        j["type"] = x.type;
    }

    inline void from_json(const json & j, ChatMsg& x) {
        x.msg = j.at("msg").get<std::string>();
        x.type = j.at("type").get<ChatMsgType>();
    }

    inline void to_json(json & j, const ChatMsg & x) {
        j = json::object();
        j["msg"] = x.msg;
        j["type"] = x.type;
    }

    inline void from_json(const json & j, UpdateTurnMsg& x) {
        x.id = j.at("id").get<int64_t>();
        x.skip = get_stack_optional<bool>(j, "skip");
        x.type = j.at("type").get<UpdateTurnMsgType>();
    }

    inline void to_json(json & j, const UpdateTurnMsg & x) {
        j = json::object();
        j["id"] = x.id;
        j["skip"] = x.skip;
        j["type"] = x.type;
    }

    inline void from_json(const json & j, UpdateNameMsg& x) {
        x.id = j.at("id").get<int64_t>();
        x.name = j.at("name").get<std::string>();
        x.type = j.at("type").get<UpdateNameMsgType>();
    }

    inline void to_json(json & j, const UpdateNameMsg & x) {
        j = json::object();
        j["id"] = x.id;
        j["name"] = x.name;
        j["type"] = x.type;
    }

    inline void from_json(const json & j, UpdateMsg& x) {
        x.id = j.at("id").get<int64_t>();
        x.reset = get_stack_optional<bool>(j, "reset");
        x.score = j.at("score").get<int64_t>();
        x.type = j.at("type").get<UpdateMsgType>();
        x.used = get_stack_optional<std::vector<bool>>(j, "used");
    }

    inline void to_json(json & j, const UpdateMsg & x) {
        j = json::object();
        j["id"] = x.id;
        j["reset"] = x.reset;
        j["score"] = x.score;
        j["type"] = x.type;
        j["used"] = x.used;
    }

    inline void from_json(const json & j, AchievementProgressType & x) {
        if (j == "achievement_progress") x = AchievementProgressType::ACHIEVEMENT_PROGRESS;
        else { throw std::runtime_error("Input JSON does not conform to schema!"); }
    }

    inline void to_json(json & j, const AchievementProgressType & x) {
        switch (x) {
            case AchievementProgressType::ACHIEVEMENT_PROGRESS: j = "achievement_progress"; break;
            default: throw std::runtime_error("This should not happen");
        }
    }

    inline void from_json(const json & j, UserIdType & x) {
        if (j == "Anonymous") x = UserIdType::ANONYMOUS;
        else if (j == "User") x = UserIdType::USER;
        else { throw std::runtime_error("Input JSON does not conform to schema!"); }
    }

    inline void to_json(json & j, const UserIdType & x) {
        switch (x) {
            case UserIdType::ANONYMOUS: j = "Anonymous"; break;
            case UserIdType::USER: j = "User"; break;
            default: throw std::runtime_error("This should not happen");
        }
    }

    inline void from_json(const json & j, AchievementUnlockType & x) {
        if (j == "achievement_unlock") x = AchievementUnlockType::ACHIEVEMENT_UNLOCK;
        else { throw std::runtime_error("Input JSON does not conform to schema!"); }
    }

    inline void to_json(json & j, const AchievementUnlockType & x) {
        switch (x) {
            case AchievementUnlockType::ACHIEVEMENT_UNLOCK: j = "achievement_unlock"; break;
            default: throw std::runtime_error("This should not happen");
        }
    }

    inline void from_json(const json & j, DiceType & x) {
        if (j == "D20") x = DiceType::D20;
        else if (j == "D6") x = DiceType::D6;
        else { throw std::runtime_error("Input JSON does not conform to schema!"); }
    }

    inline void to_json(json & j, const DiceType & x) {
        switch (x) {
            case DiceType::D20: j = "D20"; break;
            case DiceType::D6: j = "D6"; break;
            default: throw std::runtime_error("This should not happen");
        }
    }

    inline void from_json(const json & j, GameErrorType & x) {
        if (j == "error") x = GameErrorType::ERROR;
        else { throw std::runtime_error("Input JSON does not conform to schema!"); }
    }

    inline void to_json(json & j, const GameErrorType & x) {
        switch (x) {
            case GameErrorType::ERROR: j = "error"; break;
            default: throw std::runtime_error("This should not happen");
        }
    }

    inline void from_json(const json & j, RedirectType & x) {
        if (j == "redirect") x = RedirectType::REDIRECT;
        else { throw std::runtime_error("Input JSON does not conform to schema!"); }
    }

    inline void to_json(json & j, const RedirectType & x) {
        switch (x) {
            case RedirectType::REDIRECT: j = "redirect"; break;
            default: throw std::runtime_error("This should not happen");
        }
    }

    inline void from_json(const json & j, RefetchPlayerMsgType & x) {
        if (j == "refetch_player") x = RefetchPlayerMsgType::REFETCH_PLAYER;
        else { throw std::runtime_error("Input JSON does not conform to schema!"); }
    }

    inline void to_json(json & j, const RefetchPlayerMsgType & x) {
        switch (x) {
            case RefetchPlayerMsgType::REFETCH_PLAYER: j = "refetch_player"; break;
            default: throw std::runtime_error("This should not happen");
        }
    }

    inline void from_json(const json & j, RoomListMsgType & x) {
        if (j == "room_list") x = RoomListMsgType::ROOM_LIST;
        else { throw std::runtime_error("Input JSON does not conform to schema!"); }
    }

    inline void to_json(json & j, const RoomListMsgType & x) {
        switch (x) {
            case RoomListMsgType::ROOM_LIST: j = "room_list"; break;
            default: throw std::runtime_error("This should not happen");
        }
    }

    inline void from_json(const json & j, GameStateType & x) {
        if (j == "game_state") x = GameStateType::GAME_STATE;
        else { throw std::runtime_error("Input JSON does not conform to schema!"); }
    }

    inline void to_json(json & j, const GameStateType & x) {
        switch (x) {
            case GameStateType::GAME_STATE: j = "game_state"; break;
            default: throw std::runtime_error("This should not happen");
        }
    }

    inline void from_json(const json & j, WelcomeMsgType & x) {
        if (j == "welcome") x = WelcomeMsgType::WELCOME;
        else { throw std::runtime_error("Input JSON does not conform to schema!"); }
    }

    inline void to_json(json & j, const WelcomeMsgType & x) {
        switch (x) {
            case WelcomeMsgType::WELCOME: j = "welcome"; break;
            default: throw std::runtime_error("This should not happen");
        }
    }

    inline void from_json(const json & j, RestartMsgType & x) {
        if (j == "restart") x = RestartMsgType::RESTART;
        else { throw std::runtime_error("Input JSON does not conform to schema!"); }
    }

    inline void to_json(json & j, const RestartMsgType & x) {
        switch (x) {
            case RestartMsgType::RESTART: j = "restart"; break;
            default: throw std::runtime_error("This should not happen");
        }
    }

    inline void from_json(const json & j, SpectatorsMsgType & x) {
        if (j == "spectators") x = SpectatorsMsgType::SPECTATORS;
        else { throw std::runtime_error("Input JSON does not conform to schema!"); }
    }

    inline void to_json(json & j, const SpectatorsMsgType & x) {
        switch (x) {
            case SpectatorsMsgType::SPECTATORS: j = "spectators"; break;
            default: throw std::runtime_error("This should not happen");
        }
    }

    inline void from_json(const json & j, WinMsgType & x) {
        if (j == "win") x = WinMsgType::WIN;
        else { throw std::runtime_error("Input JSON does not conform to schema!"); }
    }

    inline void to_json(json & j, const WinMsgType & x) {
        switch (x) {
            case WinMsgType::WIN: j = "win"; break;
            default: throw std::runtime_error("This should not happen");
        }
    }

    inline void from_json(const json & j, RollMsgType & x) {
        if (j == "roll") x = RollMsgType::ROLL;
        else { throw std::runtime_error("Input JSON does not conform to schema!"); }
    }

    inline void to_json(json & j, const RollMsgType & x) {
        switch (x) {
            case RollMsgType::ROLL: j = "roll"; break;
            default: throw std::runtime_error("This should not happen");
        }
    }

    inline void from_json(const json & j, RollAgainMsgType & x) {
        if (j == "roll_again") x = RollAgainMsgType::ROLL_AGAIN;
        else { throw std::runtime_error("Input JSON does not conform to schema!"); }
    }

    inline void to_json(json & j, const RollAgainMsgType & x) {
        switch (x) {
            case RollAgainMsgType::ROLL_AGAIN: j = "roll_again"; break;
            default: throw std::runtime_error("This should not happen");
        }
    }

    inline void from_json(const json & j, JoinMsgType & x) {
        if (j == "join") x = JoinMsgType::JOIN;
        else { throw std::runtime_error("Input JSON does not conform to schema!"); }
    }

    inline void to_json(json & j, const JoinMsgType & x) {
        switch (x) {
            case JoinMsgType::JOIN: j = "join"; break;
            default: throw std::runtime_error("This should not happen");
        }
    }

    inline void from_json(const json & j, DisconnectMsgType & x) {
        if (j == "disconnect") x = DisconnectMsgType::DISCONNECT;
        else { throw std::runtime_error("Input JSON does not conform to schema!"); }
    }

    inline void to_json(json & j, const DisconnectMsgType & x) {
        switch (x) {
            case DisconnectMsgType::DISCONNECT: j = "disconnect"; break;
            default: throw std::runtime_error("This should not happen");
        }
    }

    inline void from_json(const json & j, ReconnectMsgType & x) {
        if (j == "reconnect") x = ReconnectMsgType::RECONNECT;
        else { throw std::runtime_error("Input JSON does not conform to schema!"); }
    }

    inline void to_json(json & j, const ReconnectMsgType & x) {
        switch (x) {
            case ReconnectMsgType::RECONNECT: j = "reconnect"; break;
            default: throw std::runtime_error("This should not happen");
        }
    }

    inline void from_json(const json & j, KickMsgType & x) {
        if (j == "kick") x = KickMsgType::KICK;
        else { throw std::runtime_error("Input JSON does not conform to schema!"); }
    }

    inline void to_json(json & j, const KickMsgType & x) {
        switch (x) {
            case KickMsgType::KICK: j = "kick"; break;
            default: throw std::runtime_error("This should not happen");
        }
    }

    inline void from_json(const json & j, ChatMsgType & x) {
        if (j == "chat") x = ChatMsgType::CHAT;
        else { throw std::runtime_error("Input JSON does not conform to schema!"); }
    }

    inline void to_json(json & j, const ChatMsgType & x) {
        switch (x) {
            case ChatMsgType::CHAT: j = "chat"; break;
            default: throw std::runtime_error("This should not happen");
        }
    }

    inline void from_json(const json & j, UpdateTurnMsgType & x) {
        if (j == "update_turn") x = UpdateTurnMsgType::UPDATE_TURN;
        else { throw std::runtime_error("Input JSON does not conform to schema!"); }
    }

    inline void to_json(json & j, const UpdateTurnMsgType & x) {
        switch (x) {
            case UpdateTurnMsgType::UPDATE_TURN: j = "update_turn"; break;
            default: throw std::runtime_error("This should not happen");
        }
    }

    inline void from_json(const json & j, UpdateNameMsgType & x) {
        if (j == "update_name") x = UpdateNameMsgType::UPDATE_NAME;
        else { throw std::runtime_error("Input JSON does not conform to schema!"); }
    }

    inline void to_json(json & j, const UpdateNameMsgType & x) {
        switch (x) {
            case UpdateNameMsgType::UPDATE_NAME: j = "update_name"; break;
            default: throw std::runtime_error("This should not happen");
        }
    }

    inline void from_json(const json & j, UpdateMsgType & x) {
        if (j == "update") x = UpdateMsgType::UPDATE;
        else { throw std::runtime_error("Input JSON does not conform to schema!"); }
    }

    inline void to_json(json & j, const UpdateMsgType & x) {
        switch (x) {
            case UpdateMsgType::UPDATE: j = "update"; break;
            default: throw std::runtime_error("This should not happen");
        }
    }
}
namespace API {
std::string Achievement::toString() const {
json j;
to_json(j, *this);
return j.dump();
}
void Achievement::fromString(const std::string &s) {
auto j = json::parse(s);
from_json(j, *this);
}
std::string AchievementData::toString() const {
json j;
to_json(j, *this);
return j.dump();
}
void AchievementData::fromString(const std::string &s) {
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
std::string RefetchPlayerMsg::toString() const {
json j;
to_json(j, *this);
return j.dump();
}
void RefetchPlayerMsg::fromString(const std::string &s) {
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
std::string RoomListMsg::toString() const {
json j;
to_json(j, *this);
return j.dump();
}
void RoomListMsg::fromString(const std::string &s) {
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
std::string SpectatorsMsg::toString() const {
json j;
to_json(j, *this);
return j.dump();
}
void SpectatorsMsg::fromString(const std::string &s) {
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
