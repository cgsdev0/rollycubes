#include "Loop.h"
#include <string>

typedef std::function<void(std::string)> Callback;

class AuthServerRequestQueue {
  public:
    AuthServerRequestQueue(std::string baseUrl, uWS::Loop *loop);
    ~AuthServerRequestQueue();

    void send(std::string url, std::string json);
    void send(std::string url, std::string json, Callback cb);

    std::string baseUrl;

  private:
    class AuthServerRequestQueueImpl;
    AuthServerRequestQueueImpl *impl;
};
