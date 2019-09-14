#include <string>
#include <regex>
#include <iostream>
#include "App.h"

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
            std::string session = getSession(req);
            if(session == "") {
                res->writeHeader("Set-Cookie", "_session=");
            }
            else std::cout << session << std::endl;
	    res->end("Hello world!");
	}).listen(3000, [](auto *token) {
	    if (token) {
		std::cout << "Listening on port " << 3000 << std::endl;
	    }
	}).run();

	std::cout << "Failed to listen on port 3000" << std::endl;
}
