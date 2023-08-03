
#pragma once


namespace API {

    struct ServerPlayer {
std::string toString() const;
void fromString(const std::string &str);
        bool connected;
        std::shared_ptr<bool> crowned;
        int64_t doubles_count;
        std::shared_ptr<std::string> name;
        int64_t roll_count;
        int64_t score;
        std::string session;
        int64_t skip_count;
        int64_t turn_count;
        std::shared_ptr<std::string> user_id;
        int64_t win_count;
    };
}
