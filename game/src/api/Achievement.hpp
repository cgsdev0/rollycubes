
#pragma once


namespace API {

    struct Achievement {
std::string toString() const;
void fromString(const std::string &str);
        std::string id;
        double progress;
        std::shared_ptr<double> rd;
        std::shared_ptr<double> rn;
        std::string unlocked;
    };
}
