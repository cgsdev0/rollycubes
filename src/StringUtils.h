#pragma once
#include <string>

// Trims a string to a certain amount of characters (unicode aware).
std::string trimString(const std::string& a, int len) {
  std::string res;
  res.reserve(len);
  int count = 0;
  for(char c : a) {
    res += c;
    if ((c & 0xC0) != 0x80) {
      c++;
    }
    if (count >= len) break;
  }
  return res;
}
