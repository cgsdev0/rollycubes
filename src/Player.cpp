#include "Player.h"

Player::Player() {}
Player::Player(std::string session) : session(session) {}

const std::string& Player::getSession() { return session; }

void Player::disconnect() { connected = false; }

bool Player::isConnected() { return connected; }
