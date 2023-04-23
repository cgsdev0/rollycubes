
#pragma once


namespace API {
    struct Achievement;
    struct UserStats;
}

namespace API {

    struct UserData {
std::string toString() const;
void fromString(const std::string &str);
        std::shared_ptr<std::vector<Achievement>> achievements;
        std::string created_date;
        std::string id;
        std::shared_ptr<std::string> image_url;
        std::shared_ptr<UserStats> stats;
        std::string username;
    };
}
