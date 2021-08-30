#pragma once
#include <chrono>
#include <unordered_set>

static const unsigned int MAX_PLAYERS = 8;
static const unsigned int MAX_CHAT_LOG = 100;
static const unsigned int DICE_COUNT = 5;
static const unsigned int SESSION_BYTES = 16;
static const unsigned int ROOM_LEN = 6;
static const unsigned int DEFAULT_PORT = 3001;
static const auto EVICT_AFTER = std::chrono::seconds(30);
static const unsigned int EVICTION_LIMIT = 10;
static const std::unordered_set<int> TARGET_SCORES = {33, 66, 67, 98, 99, 100};
static const unsigned int MAX_PLAYER_NAME = 24;
static const unsigned int MAX_CHAT_LEN = 402 + MAX_PLAYER_NAME;
