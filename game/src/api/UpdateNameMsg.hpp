
#pragma once

#include <optional>
#include <variant>

namespace API {
    enum class UpdateNameMsgType : int;
}

namespace API {

    struct UpdateNameMsg {
std::string toString() const;
void fromString(const std::string &str);
        int64_t id;
        std::string name;
        UpdateNameMsgType type = static_cast<UpdateNameMsgType>(0);
    };
}
