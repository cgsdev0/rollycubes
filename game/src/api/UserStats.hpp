
#pragma once


namespace API {

    struct UserStats {
std::string toString() const;
void fromString(const std::string &str);
        double doubles;
        double games;
        double rolls;
        double wins;
    };
}
