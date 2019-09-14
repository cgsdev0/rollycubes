#pragma once
#include <chrono>

const unsigned int MAX_PLAYERS = 4;
const unsigned int DICE_COUNT = 2;
const unsigned int SESSION_BYTES = 16;
const unsigned int ROOM_LEN = 6;
const unsigned int PORT = 3001;
const auto EVICT_AFTER = std::chrono::seconds(60);
