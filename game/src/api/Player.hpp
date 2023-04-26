
#pragma once


namespace API {

    struct Player {
std::string toString() const;
void fromString(const std::string &str);
        bool connected;
        std::shared_ptr<bool> crowned;
        std::shared_ptr<std::string> name;
        double score;
        std::shared_ptr<std::string> user_id;
        double win_count;
    };
}
