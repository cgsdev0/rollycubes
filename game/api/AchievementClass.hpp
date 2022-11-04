
#pragma once


namespace API {

    struct AchievementClass {
        std::string description;
        std::string id;
        std::shared_ptr<std::string> image_url;
        double max_progress;
        std::string name;
    };
}
