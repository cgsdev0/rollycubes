
#pragma once

#include <optional>
#include <variant>

namespace API {

    struct AuthRefreshTokenResponse {
std::string toString() const;
void fromString(const std::string &str);
        std::string access_token;
    };
}
