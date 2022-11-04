
#pragma once


namespace API {

    struct DieRoll {
std::string toString() const;
void fromString(const std::string &str);
        bool used;
        double value;
    };
}
