#ifndef STRING_UTILS_H
#define STRING_UTILS_H

#include <string>

typedef unsigned int uint;

// Trims a string to a certain amount of characters (unicode aware).
std::string trimString(const std::string &a, int len, bool strict = false);

std::string generateCode(const unsigned int len, std::string seed = "");

#endif
