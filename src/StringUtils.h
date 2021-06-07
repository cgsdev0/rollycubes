#ifndef STRING_UTILS_H
#define STRING_UTILS_H

#include <string>

// Trims a string to a certain amount of characters (unicode aware).
std::string trimString(const std::string& a, int len, bool strict = false);

#endif
