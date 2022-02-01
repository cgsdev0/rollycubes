#include "Player.h"
#include "StringUtils.h"

Player::Player() : name(""), score(0), win_count(0), connected(true) {}

Player::Player(const PerSocketData &data) : Player() {
    this->session = data.session;
    if (this->isSignedIn()) {
        this->name = data.display_name;
    }
}

Player::Player(json state) : Player() {
    state.at("name").get_to(this->name);
    state.at("score").get_to(this->score);
    state.at("win_count").get_to(this->win_count);
    state.at("session").get_to(this->session);
    this->connected = false;
}

bool Player::isSignedIn() const {
    return (this->session.find("guest:") != 0);
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
    // Signed in players cannot change their name.
    if (this->isSignedIn()) {
        throw GameError("signed in users can't change their name that way");
    }
    this->name = trimString(name, MAX_PLAYER_NAME);
}

const std::string &Player::getName() const { return this->name; }

int Player::getScore() const { return this->score; }

json Player::toJson(bool withSecrets) const {
    json result;
    result["name"] = this->name;
    result["score"] = this->score;
    result["win_count"] = this->win_count;
    result["connected"] = this->connected;
    if (this->isSignedIn()) {
        result["user_id"] = this->session;
    }
    if (withSecrets) {
        result["session"] = this->session;
    }
    return result;
}
