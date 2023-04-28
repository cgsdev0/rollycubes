
#pragma once


namespace API {

    struct UserStats {
std::string toString() const;
void fromString(const std::string &str);
        int64_t doubles;
        int64_t games;
        int64_t rolls;
        int64_t wins;
    };
}
