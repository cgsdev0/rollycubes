#include <string>
#include <vector>

template <typename T>
std::string jsonStringify(const T &t);

template <typename T>
void jsonParse(T &out, std::string s);

struct Fuck {
    std::string yeet;
    int fuck;
};

struct Fucks {
    std::vector<Fuck> fucks;
};