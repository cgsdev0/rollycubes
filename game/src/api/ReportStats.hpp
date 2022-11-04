
#pragma once


namespace API {

    struct ReportStats {
std::string toString() const;
void fromString(const std::string &str);
        double doubles;
        double games;
        std::string id;
        double rolls;
        double wins;
    };
}
