
#pragma once


#include "UserData.hpp"

namespace API {

    struct Player {
        bool connected;
        std::shared_ptr<bool> crowned;
        std::shared_ptr<std::string> name;
        double score;
        std::shared_ptr<std::string> user_id;
        std::shared_ptr<UserData> user_data;
        double win_count;
    };
}
