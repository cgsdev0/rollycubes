
#pragma once

#include <optional>
#include <variant>

namespace API {
    struct RichTextChunk;
}

namespace API {

    using ServerMsgMsg = std::variant<std::vector<MsgElement>, std::string>;
}
