#pragma once
#include <chrono>
#include <string>
#include <unordered_set>

using string = std::string;

static const uint MAX_PLAYERS = 8;
static const uint MAX_CHAT_LOG = 100;
static const uint DICE_COUNT = 2;
static const uint SESSION_BYTES = 16;
static const uint ROOM_LEN = 6;
static const uint DEFAULT_PORT = 3001;
static const auto EVICT_AFTER = std::chrono::minutes(10);
static const uint EVICTION_LIMIT = 10;
static const std::unordered_set<int> TARGET_SCORES = {33, 66, 67, 98, 99, 100};
static const uint MAX_PLAYER_NAME = 24;
static const uint MAX_CHAT_LEN = 402 + MAX_PLAYER_NAME;

const string PLAYER_COLORS[] = {
    "#e6194B",
    "#3cb44b",
    "#ffe119",
    "#4363d8",
    "#f58231",
    "#42d4f4",
    "#f032e6",
    "#fabed4",
};

class GameError {
  public:
    GameError(string err) : err(err) {}

    const string &what() { return err; }

  private:
    string err;
};

/* ws->getUserData returns one of these */
struct PerSocketData {
    string session;
    string room;
    string display_name;
    string user_id;
    bool is_verified;
    bool spectator;
    bool dedupe_conns;
};
