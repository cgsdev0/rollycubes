
#pragma once

#include <optional>
#include <variant>

namespace API {

    struct AuthDonateResponse {
std::string toString() const;
void fromString(const std::string &str);
        std::string link;
    };
}
