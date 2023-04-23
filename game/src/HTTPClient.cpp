#include "HTTPClient.h"
#include "HTTPRequest.hpp"

#include <iostream>

namespace http {
    std::string post(std::string url, std::string json, std::string preSharedKey) {
        http::Request request{url};
        http::Response response;
        if (preSharedKey.length()) {
            response = request.send("POST", json, {"Content-Type: application/json", "Authorization: Bearer " + preSharedKey});
        } else {
            response = request.send("POST", json, {"Content-Type: application/json"});
        }
        return std::string{response.body.begin(), response.body.end()};
    }

    std::string get(std::string url) {
        http::Request request{url};
        const auto response = request.send("GET");
        return std::string{response.body.begin(), response.body.end()};
    }
} // namespace http
