#include "Player.h"
#include "StringUtils.h"

Player::Player() : name(""), score(0), win_count(0), connected(true) {}

Player::Player(const PerSocketData &data) : Player() {
    session = data.session;
    if (isSignedIn()) {
        name = data.display_name;
    }
}

Player::Player(json state) : Player() {
    state.at("name").get_to(name);
    state.at("score").get_to(score);
    state.at("win_count").get_to(win_count);
    state.at("session").get_to(session);
    connected = false;
}

bool Player::isSignedIn() const {
    return (session.find("guest:") != 0);
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

void Player::reset() { score = 0; }

void Player::setName(std::string &name) {
    // Signed in players cannot change their name.
    if (isSignedIn()) {
        throw GameError("signed in users can't change their name that way");
    }
    name = trimString(name, MAX_PLAYER_NAME);
}

const std::string &Player::getName() const { return name; }

int Player::getScore() const { return score; }

json Player::toJson(bool withSecrets) const {
    json result;
    result["name"] = name;
    result["score"] = score;
    result["win_count"] = win_count;
    result["connected"] = connected;
    if (isSignedIn()) {
        result["user_id"] = session;
    }
    if (withSecrets) {
        result["session"] = session;
    }
    return result;
}
