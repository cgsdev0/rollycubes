
#pragma once

#include <optional>
#include <variant>

namespace API {
    enum class UsernameChunkType : int;
}

namespace API {

    struct UsernameChunk {
std::string toString() const;
void fromString(const std::string &str);
        std::string name;
        UsernameChunkType type = static_cast<UsernameChunkType>(0);
        std::optional<std::string> user_id;
    };
}
