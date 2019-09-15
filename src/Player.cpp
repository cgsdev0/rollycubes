#include "Player.h"

Player::Player() : name("Loading..."), score(0), win_count(0) {}

Player::Player(std::string session) : session(session) { Player(); }

const std::string& Player::getSession() const { return session; }

void Player::disconnect() { connected = false; }

bool Player::isConnected() const { return connected; }

int Player::addScore(int n) {
    score + n;
    return score;
}

int Player::addWin(int n) {
    win_count + n;
    return win_count;
}

void Player::reset() { int score = 0; }

void Player::setName(std::string& name) {
    this->name = name.substr(0, MAX_PLAYER_NAME);
}

const std::string& Player::getName() { return this->name; }

json Player::toJson() const {
    json result;
    result["name"] = this->name;
    result["score"] = this->score;
    result["win_count"] = this->win_count;
    result["connected"] = this->connected;
    return result;
}
