
#include <string>

namespace http {
    std::string post(std::string url, std::string json, std::string preSharedKey = "");
    std::string get(std::string url);
} // namespace http
