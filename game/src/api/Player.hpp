
#pragma once


namespace API {

    struct Player {
std::string toString() const;
void fromString(const std::string &str);
        bool connected;
        std::shared_ptr<bool> crowned;
        std::shared_ptr<std::string> name;
        int64_t score;
        int64_t skip_count;
        std::shared_ptr<std::string> user_id;
        int64_t win_count;
    };
}
