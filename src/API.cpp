#include "API.h"
#include <json.hpp>
#include <string>
#include <utility>

using json = nlohmann::json;

template <typename T>
std::string jsonStringify(const T &t) {
    json j;
    to_json(j, t);
    j["type"] = structName(t);
    return j.dump();
}

template <typename T>
void jsonParse(T &out, std::string s) {
    json j = json::parse(s);
    from_json(j, out);
}

// Helper function that converts a character to lowercase on compile time
constexpr char charToLower(const char c) {
    return (c >= 'A' && c <= 'Z') ? c + ('a' - 'A') : c;
}

// Our compile time string class that is used to pass around the converted string
template <std::size_t N>
class const_str {
  private:
    const char s[N + 1]; // One extra byte to fill with a 0 value

  public:
    // Constructor that is given the char array and an integer sequence to use parameter pack expansion on the array
    template <typename T, T... Nums>
    constexpr const_str(const char (&str)[N], std::integer_sequence<T, Nums...>)
        : s{charToLower(str[Nums])..., 0} {
    }

    // Compile time access operator to the characters
    constexpr char operator[](std::size_t i) const {
        return s[i];
    }

    // Get a pointer to the array at runtime. Even though this happens at runtime, this is a fast operation and much faster than the actual conversion
    operator const char *() const {
        return s;
    }
};

// The code that we are actually going to call
template <std::size_t N>
constexpr const_str<N> toLower(const char (&str)[N]) {
    return {str, std::make_integer_sequence<unsigned, N>()};
}

#define JSON_SERIALIZATION(x, ...)                     \
    NLOHMANN_DEFINE_TYPE_NON_INTRUSIVE(x, __VA_ARGS__) \
    constexpr auto structName(const x &i) {            \
        return toLower(#x);                            \
    }                                                  \
    template std::string jsonStringify<x>(const x &t); \
    template void jsonParse<x>(x & t, std::string s);

/*************************************************\
|                                                 |
|   DEFINE NEW SERIALIZABLE MESSAGE STRUCTS HERE  |
|                                                 |
\*************************************************/
JSON_SERIALIZATION(Fuck, fuck, yeet)
JSON_SERIALIZATION(Fucks, fucks)