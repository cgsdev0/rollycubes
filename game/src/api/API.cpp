

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
#include "Player.hpp"
#include "UserData.hpp"
#include "Achievement.hpp"
#include "AchievementClass.hpp"
#include "UserStats.hpp"
#include "DieRoll.hpp"

namespace nlohmann {
    void from_json(const json & j, API::DieRoll & x);
    void to_json(json & j, const API::DieRoll & x);

    void from_json(const json & j, API::UserStats & x);
    void to_json(json & j, const API::UserStats & x);

    void from_json(const json & j, API::AchievementClass & x);
    void to_json(json & j, const API::AchievementClass & x);

    void from_json(const json & j, API::Achievement & x);
    void to_json(json & j, const API::Achievement & x);

    void from_json(const json & j, API::UserData & x);
    void to_json(json & j, const API::UserData & x);

    void from_json(const json & j, API::Player & x);
    void to_json(json & j, const API::Player & x);

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

    inline void from_json(const json & j, API::DieRoll& x) {
        x.used = j.at("used").get<bool>();
        x.value = j.at("value").get<double>();
    }

    inline void to_json(json & j, const API::DieRoll & x) {
        j = json::object();
        j["used"] = x.used;
        j["value"] = x.value;
    }

    inline void from_json(const json & j, API::UserStats& x) {
        x.doubles = j.at("doubles").get<double>();
        x.games = j.at("games").get<double>();
        x.rolls = j.at("rolls").get<double>();
        x.wins = j.at("wins").get<double>();
    }

    inline void to_json(json & j, const API::UserStats & x) {
        j = json::object();
        j["doubles"] = x.doubles;
        j["games"] = x.games;
        j["rolls"] = x.rolls;
        j["wins"] = x.wins;
    }

    inline void from_json(const json & j, API::AchievementClass& x) {
        x.description = j.at("description").get<std::string>();
        x.id = j.at("id").get<std::string>();
        x.image_url = API::get_optional<std::string>(j, "image_url");
        x.max_progress = j.at("max_progress").get<double>();
        x.name = j.at("name").get<std::string>();
    }

    inline void to_json(json & j, const API::AchievementClass & x) {
        j = json::object();
        j["description"] = x.description;
        j["id"] = x.id;
        j["image_url"] = x.image_url;
        j["max_progress"] = x.max_progress;
        j["name"] = x.name;
    }

    inline void from_json(const json & j, API::Achievement& x) {
        x.achievement = j.at("achievement").get<API::AchievementClass>();
        x.progress = j.at("progress").get<double>();
        x.unlocked = j.at("unlocked").get<std::string>();
    }

    inline void to_json(json & j, const API::Achievement & x) {
        j = json::object();
        j["achievement"] = x.achievement;
        j["progress"] = x.progress;
        j["unlocked"] = x.unlocked;
    }

    inline void from_json(const json & j, API::UserData& x) {
        x.created_date = j.at("createdDate").get<std::string>();
        x.id = j.at("id").get<std::string>();
        x.image_url = API::get_optional<std::string>(j, "image_url");
        x.stats = API::get_optional<API::UserStats>(j, "stats");
        x.username = j.at("username").get<std::string>();
        x.user_to_achievements = j.at("userToAchievements").get<std::vector<API::Achievement>>();
    }

    inline void to_json(json & j, const API::UserData & x) {
        j = json::object();
        j["createdDate"] = x.created_date;
        j["id"] = x.id;
        j["image_url"] = x.image_url;
        j["stats"] = x.stats;
        j["username"] = x.username;
        j["userToAchievements"] = x.user_to_achievements;
    }

    inline void from_json(const json & j, API::Player& x) {
        x.connected = j.at("connected").get<bool>();
        x.crowned = API::get_optional<bool>(j, "crowned");
        x.name = API::get_optional<std::string>(j, "name");
        x.score = j.at("score").get<double>();
        x.user_id = API::get_optional<std::string>(j, "user_id");
        x.user_data = API::get_optional<API::UserData>(j, "userData");
        x.win_count = j.at("win_count").get<double>();
    }

    inline void to_json(json & j, const API::Player & x) {
        j = json::object();
        j["connected"] = x.connected;
        j["crowned"] = x.crowned;
        j["name"] = x.name;
        j["score"] = x.score;
        j["user_id"] = x.user_id;
        j["userData"] = x.user_data;
        j["win_count"] = x.win_count;
    }

    inline void from_json(const json & j, API::WelcomeMsg& x) {
        x.chat_log = j.at("chatLog").get<std::vector<std::string>>();
        x.id = j.at("id").get<double>();
        x.players = j.at("players").get<std::vector<API::Player>>();
        x.private_session = j.at("privateSession").get<bool>();
        x.rolled = j.at("rolled").get<bool>();
        x.rolls = j.at("rolls").get<std::vector<double>>();
        x.turn_index = j.at("turn_index").get<double>();
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
        x.id = j.at("id").get<double>();
        x.type = j.at("type").get<API::RestartMsgType>();
    }

    inline void to_json(json & j, const API::RestartMsg & x) {
        j = json::object();
        j["id"] = x.id;
        j["type"] = x.type;
    }

    inline void from_json(const json & j, API::WinMsg& x) {
        x.id = j.at("id").get<double>();
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
        x.id = j.at("id").get<double>();
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
        x.id = j.at("id").get<double>();
        x.type = j.at("type").get<API::DisconnectMsgType>();
    }

    inline void to_json(json & j, const API::DisconnectMsg & x) {
        j = json::object();
        j["id"] = x.id;
        j["type"] = x.type;
    }

    inline void from_json(const json & j, API::ReconnectMsg& x) {
        x.id = j.at("id").get<double>();
        x.type = j.at("type").get<API::ReconnectMsgType>();
    }

    inline void to_json(json & j, const API::ReconnectMsg & x) {
        j = json::object();
        j["id"] = x.id;
        j["type"] = x.type;
    }

    inline void from_json(const json & j, API::KickMsg& x) {
        x.id = j.at("id").get<double>();
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
        x.id = j.at("id").get<double>();
        x.type = j.at("type").get<API::UpdateTurnMsgType>();
    }

    inline void to_json(json & j, const API::UpdateTurnMsg & x) {
        j = json::object();
        j["id"] = x.id;
        j["type"] = x.type;
    }

    inline void from_json(const json & j, API::UpdateNameMsg& x) {
        x.id = j.at("id").get<double>();
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
        x.id = j.at("id").get<double>();
        x.reset = API::get_optional<bool>(j, "reset");
        x.score = j.at("score").get<double>();
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
