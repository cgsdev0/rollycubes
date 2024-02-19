
#pragma once

#include <optional>
#include <variant>

#include "MsgElement.hpp"
#include "RichTextChunk.hpp"

namespace API {
    enum class RichTextMsgType : int;
}

namespace API {

    struct RichTextMsg {
std::string toString() const;
void fromString(const std::string &str);
        std::vector<MsgElement> msg;
        RichTextMsgType type = static_cast<RichTextMsgType>(0);
    };
}
