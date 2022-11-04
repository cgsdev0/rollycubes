
#pragma once


#include "UserStats.hpp"

namespace API {
    struct Achievement;
}

namespace API {

    struct UserData {
        std::string created_date;
        std::string id;
        std::shared_ptr<std::string> image_url;
        std::shared_ptr<UserStats> stats;
        std::string username;
        std::vector<Achievement> user_to_achievements;
    };
}
