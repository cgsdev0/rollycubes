#include <string>
#include <regex>
#include <iostream>
#include "App.h"
#include <sstream>
#include <random>
#include <fstream>
#include <streambuf>

const unsigned int PORT = 3001;

typedef uWS::HttpResponse<false> HttpResponse;
typedef uWS::HttpRequest HttpRequest;

unsigned int random_char() {
    std::random_device rd;
    std::mt19937 gen(rd());
    std::uniform_int_distribution<> dis(0, 255);
    return dis(gen);
}

std::string generate_hex(const unsigned int len) {
    std::stringstream ss;
    for (auto i = 0; i < len; i++) {
        const auto rc = random_char();
        std::stringstream hexstream;
        hexstream << std::hex << rc;
        auto hex = hexstream.str();
        ss << (hex.length() < 2 ? '0' + hex : hex);
    }
    return ss.str();
}
std::regex sessionRegex("_session=([^;]*)");

std::string getSession(HttpRequest* req) {
    std::smatch cookies;
    std::string s(req->getHeader("cookie"));
    std::regex_search(s, cookies, sessionRegex);
    return cookies[1].str();
}

/* ws->getUserData returns one of these */
    struct PerSocketData {

    };

    /* Very simple WebSocket echo server */
int main() {
	/* Overly simple hello world app */
	uWS::App().get("/cookie", [](auto *res, auto *req) {
            std::string session = getSession(req);
            if(session == "") {
                session = generate_hex(16);
                res->writeHeader("Set-Cookie", "_session="+session);
            }
            res->end();
	})

.ws<PerSocketData>("/ws", {
        /* Settings */
        .compression = uWS::SHARED_COMPRESSOR,
        .maxPayloadLength = 16 * 1024,
        /* Handlers */
        .open = [](auto *ws, auto *req) {
            std::cout << getSession(req) << std::endl;
            ws->send(getSession(req), uWS::OpCode::TEXT);
        },
        .message = [](auto *ws, std::string_view message, uWS::OpCode opCode) {
            ws->send(message, opCode);
        },
        .drain = [](auto *ws) {
            /* Check getBufferedAmount here */
        },
        .ping = [](auto *ws) {

        },
        .pong = [](auto *ws) {

        },
        .close = [](auto *ws, int code, std::string_view message) {
            std::cout<<"CLOSING "<<message<<std::endl;
        }
})
        .listen(PORT, [](auto *token) {
	    if (token) {
		std::cout << "Listening on port " << PORT << std::endl;
	    }
	}).run();

	std::cout << "Failed to listen on port " << PORT << std::endl;
}
