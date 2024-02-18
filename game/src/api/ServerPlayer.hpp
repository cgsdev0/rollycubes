
#pragma once

#include <optional>
#include <variant>

namespace API {

    struct ServerPlayer {
        std::string toString() const;
        void fromString(const std::string &str);
        bool connected;
        std::optional<bool> crowned;
        std::vector<int64_t> dice_hist;
        int64_t doubles_count;
        std::optional<std::string> name;
        int64_t roll_count;
        int64_t score;
        std::string session;
        int64_t skip_count;
        std::vector<int64_t> sum_hist;
        int64_t turn_count;
        std::optional<std::string> user_id;
        int64_t win_count;
        std::vector<int64_t> win_hist;
    };
} // namespace API
