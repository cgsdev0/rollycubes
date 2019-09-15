#include "Player.h"

Player::Player() {}

Player::Player(std::string session) : session(session) {}

const std::string& Player::getSession() const { return session; }

void Player::disconnect() { connected = false; }

bool Player::isConnected() const { return connected; }
