
#pragma once


namespace API {

    struct ServerPlayer {
std::string toString() const;
void fromString(const std::string &str);
        bool connected;
        std::shared_ptr<bool> crowned;
        double doubles_count;
        std::shared_ptr<std::string> name;
        double roll_count;
        double score;
        std::string session;
        double turn_count;
        std::shared_ptr<std::string> user_id;
        double win_count;
    };
}
