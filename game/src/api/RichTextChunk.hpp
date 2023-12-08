
#pragma once

#include <optional>
#include <variant>

namespace API {
    enum class Alignment : int;
    enum class Modifier : int;
    enum class RichTextChunkType : int;
}

namespace API {

    struct RichTextChunk {
std::string toString() const;
void fromString(const std::string &str);
        std::optional<Alignment> alignment;
        std::optional<std::string> color;
        std::optional<std::vector<Modifier>> modifiers;
        std::string text;
        RichTextChunkType type = static_cast<RichTextChunkType>(0);
        std::optional<std::string> user_id;
    };
}
