
#pragma once

#include <optional>
#include <variant>

namespace API {

    struct LoginRequest {
std::string toString() const;
void fromString(const std::string &str);
        std::optional<std::string> anon_id;
        std::string code;
        std::string redirect_uri;
        std::string state;
    };
}
