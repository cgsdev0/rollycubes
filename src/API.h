#include <string>
#include <vector>

#define JSON_SERIALIZABLE() \
    std::string toString(); \
    void fromString(const std::string &str);

struct Fuck {
    std::string yeet;
    int fuck;

    JSON_SERIALIZABLE()
};

struct Fucks {
    std::vector<Fuck> fucks;

    JSON_SERIALIZABLE()
};