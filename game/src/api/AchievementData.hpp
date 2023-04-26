
#pragma once


namespace API {

    struct AchievementData {
std::string toString() const;
void fromString(const std::string &str);
        std::string description;
        std::string id;
        std::shared_ptr<std::string> image_url;
        std::shared_ptr<double> max_progress;
        std::string name;
    };
}
