
#pragma once

#include <optional>

namespace API {

    struct AuthRefreshTokenResponse {
std::string toString() const;
void fromString(const std::string &str);
        std::string access_token;
    };
}
