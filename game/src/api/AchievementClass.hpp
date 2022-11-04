
#pragma once


namespace API {

    struct AchievementClass {
std::string toString() const;
void fromString(const std::string &str);
        std::string description;
        std::string id;
        std::shared_ptr<std::string> image_url;
        double max_progress;
        std::string name;
    };
}
