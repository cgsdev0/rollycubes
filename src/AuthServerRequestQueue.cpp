#include "AuthServerRequestQueue.h"
#include "HTTPClient.h"
#include "RequestQueue.h"
#include <fstream>
#include <thread>

struct AuthServerRequest {
    std::string url;
    std::string jsonBody;
};

class AuthServerRequestQueue::AuthServerRequestQueueImpl {
  public:
    AuthServerRequestQueueImpl(const std::string &key) : preSharedKey(key), t(&AuthServerRequestQueueImpl::runRequestLoop, this) {
    }

    void runRequestLoop() {
        while (true) {
            auto request = requestQueue.pop();
            http::post(request.url, request.jsonBody, preSharedKey);
        }
    }

    RequestQueue<AuthServerRequest> requestQueue;

  private:
    std::string preSharedKey;
    std::thread t;
};

void AuthServerRequestQueue::send(std::string url, std::string json) {
    AuthServerRequest req{
        .url = this->baseUrl + url,
        .jsonBody = json};
    impl->requestQueue.push(req);
}

AuthServerRequestQueue::AuthServerRequestQueue(std::string baseUrl)
    : baseUrl(baseUrl) {

    std::ifstream preSharedKeyFile(".pre-shared-key");
    if (!preSharedKeyFile.is_open())
        throw std::runtime_error("no .pre-shared-key file found!");
    std::string key;
    preSharedKeyFile >> key;
    preSharedKeyFile.close();

    // Starts the request loop thread
    this->impl = new AuthServerRequestQueueImpl(key);
}

AuthServerRequestQueue::~AuthServerRequestQueue() {
    delete impl;
}
