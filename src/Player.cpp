#include "Player.h"

Player::Player() : name(""), score(0), win_count(0), connected(true) {}

Player::Player(std::string session, PlayerClaim claim) : Player() {
    this->session = session;
    this->claim = claim;
}

const std::string &Player::getSession() const { return session; }

void Player::disconnect() { connected = false; }

void Player::reconnect() { connected = true; }

bool Player::isConnected() const { return connected; }

int Player::addScore(int n) {
    score += n;
    return score;
}

int Player::addWin(int n) {
    win_count += n;
    return win_count;
}

void Player::reset() { this->score = 0; }

void Player::setName(std::string &name) {
    this->name = name.substr(0, MAX_PLAYER_NAME);
}

void Player::setSession(std::string session) {
    this->session = session;
}

const std::string &Player::getName() const {
    if (this->claim.verified && this->name == "") {
        return this->claim.username;
    }
    return this->name;
}

int Player::getScore() const { return this->score; }

json Player::toJson() const {
    json result;
    result["name"] = this->getName();
    result["score"] = this->score;
    result["win_count"] = this->win_count;
    result["connected"] = this->connected;
    if (this->claim.verified) {
        result["verified"] = true;
        result["sub"] = this->claim.sub;
        result["picture"] = this->claim.picture_url;
    }
    return result;
}
