#include "AuthServerRequestQueue.h"
#include "HTTPClient.h"
#include "RequestQueue.h"
#include <fstream>
#include <iostream>
#include <optional>
#include <thread>

struct AuthServerRequest {
    std::string url;
    std::string jsonBody;
    std::optional<Callback> cb;
};

class AuthServerRequestQueue::AuthServerRequestQueueImpl {
  public:
    AuthServerRequestQueueImpl(const std::string &key, uWS::Loop *loop) : loop(loop), preSharedKey(key), t(&AuthServerRequestQueueImpl::runRequestLoop, this) {
        std::cout << "Pre-shared-key length: " << key.length() << std::endl;
    }

    void runRequestLoop() {
        while (true) {
            auto request = requestQueue.pop();
            auto resp = http::post(request.url, request.jsonBody, preSharedKey);
            if (request.cb) {
                // Schedule callback on the game logic thread
                loop->defer([request, resp]() {
                    (*request.cb)(resp);
                });
            }
        }
    }

    RequestQueue<AuthServerRequest> requestQueue;

  private:
    uWS::Loop *loop;
    std::string preSharedKey;
    std::thread t;
};

void AuthServerRequestQueue::send(std::string url, std::string json) {
    AuthServerRequest req{
        .url = this->baseUrl + url,
        .jsonBody = json};
    impl->requestQueue.push(req);
}

void AuthServerRequestQueue::send(std::string url, std::string json, Callback cb) {
    AuthServerRequest req{
        .url = this->baseUrl + url,
        .jsonBody = json,
        .cb = cb};
    impl->requestQueue.push(req);
}

AuthServerRequestQueue::AuthServerRequestQueue(std::string baseUrl, uWS::Loop *loop)
    : baseUrl(baseUrl) {

    std::ifstream preSharedKeyFile("./secrets/.pre-shared-key");
    if (!preSharedKeyFile.is_open())
        throw std::runtime_error("no .pre-shared-key file found!");
    std::string key;
    preSharedKeyFile >> key;
    preSharedKeyFile.close();

    // Starts the request loop thread
    this->impl = new AuthServerRequestQueueImpl(key, loop);
}

AuthServerRequestQueue::~AuthServerRequestQueue() {
    delete impl;
}
