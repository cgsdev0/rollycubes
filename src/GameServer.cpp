#include "App.h"
#include <string>
#include <regex>
#include <iostream>

std::regex sessionRegex("_session=([^;]*)");

std::string getSession(uWS::HttpRequest* req) {
    std::smatch cookies;
    std::string s(req->getHeader("cookie"));
    std::regex_search(s, cookies, sessionRegex);
    return cookies[1].str();
}

int main() {
	/* Overly simple hello world app */
	uWS::App().get("/", [](auto *res, auto *req) {
            res->writeHeader("Set-Cookie", "_session=spaghetti");
	    res->end("Hello world!");
            std::cout << getSession(req) << std::endl;
	}).listen(3000, [](auto *token) {
	    if (token) {
		std::cout << "Listening on port " << 3000 << std::endl;
	    }
	}).run();

	std::cout << "Failed to listen on port 3000" << std::endl;
}
