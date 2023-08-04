
#pragma once

#include <optional>

namespace API {
    enum class RedirectType : int;
}

namespace API {

    struct Redirect {
        std::string room;
        RedirectType type;
    };
}
