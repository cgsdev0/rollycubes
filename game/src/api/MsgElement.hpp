
#pragma once

#include <optional>
#include <variant>

namespace API {
    struct RichTextChunk;
}

namespace API {

    using MsgElement = std::variant<RichTextChunk, std::string>;
}
