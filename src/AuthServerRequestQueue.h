#include <string>

class AuthServerRequestQueue {
  public:
    AuthServerRequestQueue(std::string baseUrl);
    ~AuthServerRequestQueue();

    void send(std::string url, std::string json);

    std::string baseUrl;

  private:
    class AuthServerRequestQueueImpl;
    AuthServerRequestQueueImpl *impl;
};
