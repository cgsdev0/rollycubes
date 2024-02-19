
#pragma once

#include <optional>
#include <variant>

namespace API {

    struct UserStats {
std::string toString() const;
void fromString(const std::string &str);
        std::vector<int64_t> dice_hist;
        int64_t doubles;
        int64_t games;
        int64_t rolls;
        std::vector<int64_t> sum_hist;
        std::vector<int64_t> win_hist;
        int64_t wins;
    };
}
