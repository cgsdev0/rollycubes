#include <cstdlib>
#include <iostream>
#include <json.hpp>
#include <random>
#include <set>

#include <regex>
#include <signal.h>
#include <string>
#include <string_view>
#include <unistd.h>
#include <variant>

#include "App.h"
#include "Consts.h"
#include "Game.h"

#include "AuthServerRequestQueue.h"
#include "GameCoordinator.h"
#include "JWTVerifier.h"
#include "MoveOnlyFunction.h"

#include "Metrics.h"
#include "RngOverTcp.h"
#include <prometheus/counter.h>
#include <prometheus/registry.h>
#include <prometheus/text_serializer.h>

#define DONT_REUSE_THE_FUCKING_PORT_LINUX 1

template <typename T>
concept can_roll = requires(T value) {
    { value.roll() } -> std::convertible_to<std::vector<int>>;
};

template <can_roll T>
struct BaseRngServer : public T {};

struct CppRngServer {
    std::uniform_int_distribution<int> dis{1, 6};
    std::random_device rd;
    std::mt19937 gen;

    CppRngServer() {
        // seed the RNG (once per boot)
        gen.seed(rd());
    }

    std::vector<int> roll() {
        return std::vector{dis(gen), dis(gen)};
    }
};

template <can_roll... Ts>
using CanRollVariant = std::variant<Ts...>;

using RngServer = CanRollVariant<BaseRngServer<FortranRngServer>, BaseRngServer<CppRngServer>>;

auto roll(RngServer &element) {
    return std::visit([](auto &&el) { return el.roll(); }, element);
}

// for convenience
using json = nlohmann::json;

typedef uWS::HttpResponse<false> HttpResponse;
typedef uWS::HttpRequest HttpRequest;

std::function<void(void)> signal_handler;
void signal_callback_handler(int signum) {
    signal_handler();
}

std::string getSession(HttpRequest *req) {
    const std::regex sessionRegex("_session=([^;]*)");
    std::smatch cookies;
    std::string s(req->getHeader("cookie"));
    std::regex_search(s, cookies, sessionRegex);
    return "guest:" + std::string(cookies[1].str());
}

void connectNewPlayer(uWS::App *app, uWS::WebSocket<false, true, PerSocketData> *ws, PerSocketData *userData, GameCoordinator &coordinator) {
    auto it = coordinator.games.find(userData->room);
    if (it != coordinator.games.end()) {
        // Connecting to a valid game
        Game *g = it->second;

        auto welcome = [g, userData, ws, app, &coordinator]() {
            auto msg = g->toWelcomeMsg();
            msg.id = (userData->spectator) ? -1 : g->getPlayerId(userData->session);
            ws->send(msg.toString(), uWS::OpCode::TEXT);
            ws->subscribe(userData->room);
            if (userData->spectator) {
                API::SpectatorsMsg spec;
                spec.count = g->incrSpectators();
                ws->publish(userData->room, spec.toString(), uWS::OpCode::TEXT);
            } else {
                app->publish("home/list", coordinator.list_rooms().toString(), uWS::OpCode::TEXT);
            }
        };
        if (!userData->spectator) {
            if (!(g->hasPlayer(userData->session) || g->hasPlayer(userData->session_from_cookie))) {
                json resp = g->addPlayer(*userData);
                if (resp.is_null()) {
                    // room is full
                    std::string err = API::GameError({.error = "room full"}).toString();
                    ws->send(err, uWS::OpCode::TEXT);
                    userData->spectator = true;
                    welcome();
                    return;
                }
                app->publish(userData->room, resp.dump(), uWS::OpCode::TEXT);
            } else {
                json resp = g->reconnectPlayer(userData->session, userData->session_from_cookie, *userData);
                app->publish(userData->room, resp.dump(), uWS::OpCode::TEXT);
            }
        }
        welcome();
    } else if (userData->spectator) {
        ws->close();
        return;
    } else {
        // Connecting to a non-existant room
        // let's migrate them to a new room
        userData->room = coordinator.createRoom(true, userData->room);
        API::Redirect msg{.room = userData->room};
        ws->send(msg.toString(), uWS::OpCode::TEXT);
    }
}

uWS::App::WebSocketBehavior<PerSocketData> makeWebsocketBehavior(uWS::App *app, const JWTVerifier &jwt_verifier, AuthServerRequestQueue &authServer, Metrics &metrics, GameCoordinator &coordinator, RngServer &rng) {

    return {/* Settings */
            .compression = uWS::SHARED_COMPRESSOR,
            .maxPayloadLength = 16 * 1024,
            /* Handlers */
            .upgrade =
                [&, app](auto *res, auto *req, auto *context) {
                    std::string session = getSession(req);
                    std::string session_from_cookie = session;
                    bool is_verified = true;
                    std::string mode = std::string(req->getParameter(0));
                    std::string room = std::string(req->getParameter(1));
                    std::string user_id = std::string(req->getQuery("userId"));
                    if (user_id.length()) {
                        session = user_id;
                        is_verified = false;
                    }
                    bool dedupe_conns = false;
                    auto it = coordinator.games.find(room);
                    if (it != coordinator.games.end()) {
                        // Connecting to a valid game
                        Game *g = it->second;
                        if (g->isPlayerConnected(session)) {
                            dedupe_conns = true;
                        }
                        if (g->isPlayerConnected(session_from_cookie)) {
                            dedupe_conns = true;
                        }
                    }
                    res->template upgrade<PerSocketData>(
                        {.session = session,
                         .session_from_cookie = session_from_cookie,
                         .room = room,
                         .display_name = "",
                         .user_id = "",
                         .is_verified = is_verified,
                         .spectator = (mode == "spectate"),
                         .dedupe_conns = dedupe_conns},
                        req->getHeader("sec-websocket-key"),
                        req->getHeader("sec-websocket-protocol"),
                        req->getHeader("sec-websocket-extensions"),
                        context);
                },
            .open =
                [&, app](auto *ws) {
                    metrics.ws_counter->Increment();
                    PerSocketData *userData =
                        (PerSocketData *)ws->getUserData();

                    if (userData->session == "guest:") {
                        ws->send("cookie", uWS::OpCode::TEXT);
                        userData->is_verified = false;
                        return;
                    }
                    if (userData->dedupe_conns) {
                        json resp;
                        resp["error"] = "already connected";
                        ws->send(resp.dump(), uWS::OpCode::TEXT);
                        return;
                    }
                    if (!userData->is_verified) {
                        // We shouldn't mutate the game state until we're sure this user is
                        // real.
                        return;
                    }
                    connectNewPlayer(app, ws, userData, coordinator);
                },
            .message =
                [&, app](auto *ws, std::string_view message, uWS::OpCode opCode) {
                    PerSocketData *userData =
                        (PerSocketData *)ws->getUserData();

                    if (userData->dedupe_conns) return;
                    if (userData->spectator) return;

                    std::string room = userData->room;
                    std::string session = userData->session;
                    std::string response;
                    try {
                        auto data = json::parse(message);
                        if (!data["type"].is_string())
                            throw API::GameError({.error = "Type is not specified correctly"});
                        auto action_type = data["type"].get<std::string>();
                        if (action_type == "authenticate") {
                            auto token = data["access_token"].get<std::string>();
                            try {
                                auto claim = jwt_verifier.decode_and_verify(token);
                                userData->is_verified = true;
                                userData->user_id = claim.user_id;
                                userData->display_name = claim.display_name;
                                connectNewPlayer(app, ws, userData, coordinator);

                            } catch (const std::runtime_error &e) {
                                std::cout << "authentication error\n"
                                          << e.what() << std::endl;
                                ws->close();
                            }
                        } else {
                            // Toss out any messages from unverified connection
                            if (!userData->is_verified) return;
                            auto it = coordinator.games.find(room);
                            if (it != coordinator.games.end()) {
                                Game *g = it->second;
                                g->handleMessage(
                                    [ws, room, app](auto s) {
                                        // ws->send(s, uWS::OpCode::TEXT);
                                        app->publish(room, s, uWS::OpCode::TEXT);
                                    },
                                    {
                                        .send =
                                            [ws](auto s) { ws->send(s, uWS::OpCode::TEXT); },
                                        .reportStats = [&authServer](auto url, auto json) { authServer.send(url, json); },
                                        .reportStats2 = [&authServer](auto url, auto json, auto cb) { authServer.send(url, json, cb); },
                                        .do_a_roll = [&rng]() { return roll(rng); },
                                    },
                                    data, session);
                                /*if (data["type"].is_string()) {
                                  if (data["type"] == "leave") {
                                  ws->close();
                                  }
                                  }*/
                            } else {
                                response = API::GameError({.error = "Room not found: " + room}).toString();
                            }
                        }
                    } catch (API::GameError &e) {
                        response = e.toString();
                    } catch (nlohmann::detail::parse_error &e) {
                        std::cout << "RECEIVED BAD JSON (parse_error): " << message
                                  << std::endl
                                  << e.what() << std::endl;
                        response = API::GameError({.error = e.what()}).toString();
                    } catch (nlohmann::detail::type_error &e) {
                        std::cout << "HANDLED BAD JSON (type_error): " << message
                                  << std::endl
                                  << e.what() << std::endl;
                        response = API::GameError({.error = e.what()}).toString();
                    } catch (nlohmann::detail::invalid_iterator &e) {
                        std::cout << "HANDLED BAD JSON (invalid_iterator): " << message
                                  << std::endl
                                  << e.what() << std::endl;
                        response = API::GameError({.error = e.what()}).toString();
                    } catch (nlohmann::detail::out_of_range &e) {
                        std::cout << "HANDLED BAD JSON (out_of_range): " << message
                                  << std::endl
                                  << e.what() << std::endl;
                        response = API::GameError({.error = e.what()}).toString();
                    } catch (nlohmann::detail::other_error &e) {
                        std::cout << "HANDLED BAD JSON (other_error): " << message
                                  << std::endl
                                  << e.what() << std::endl;
                        response = API::GameError({.error = e.what()}).toString();
                    }
                    if (response.length())
                        ws->send(response, uWS::OpCode::TEXT);
                },
            .close =
                [&, app](auto *ws, int code, std::string_view message) {
                    PerSocketData *userData =
                        (PerSocketData *)ws->getUserData();
                    metrics.ws_counter->Decrement();

                    if (userData->dedupe_conns) return;

                    std::string room = userData->room;
                    std::string session = userData->session;
                    auto it = coordinator.games.find(room);
                    if (it != coordinator.games.end()) {
                        Game *g = it->second;
                        if (userData->spectator) {
                            API::SpectatorsMsg spec;
                            spec.count = g->decrSpectators();
                            ws->publish(userData->room, spec.toString(), uWS::OpCode::TEXT);
                            return;
                        }
                        json resp = g->disconnectPlayer(session);
                        if (!resp.is_null()) {
                            app->publish(room, resp.dump(), uWS::OpCode::TEXT);
                            app->publish("home/list", coordinator.list_rooms().toString(), uWS::OpCode::TEXT);
                        }
                        if (!g->connectedPlayerCount()) {
                            coordinator.queue_eviction(room);
                        }
                    }
                }};
}

uWS::App::WebSocketBehavior<HomeSocketData> makeHomeWebsocketBehavior(uWS::App *app, const JWTVerifier &jwt_verifier, AuthServerRequestQueue &authServer, Metrics &metrics, GameCoordinator &coordinator) {

    return {/* Settings */
            .compression = uWS::SHARED_COMPRESSOR,
            .maxPayloadLength = 16 * 1024,
            /* Handlers */
            .open =
                [&, app](auto *ws) {
                    ws->subscribe("home/list");
                    ws->send(coordinator.list_rooms().toString(), uWS::OpCode::TEXT);
                }};
}

const std::set<std::string> allowed_origins{
    "https://rollycubes.com",
    "https://prod.rollycubes.com",
    "https://beta.rollycubes.com",
    "https://www.rollycubes.com",
    "https://rollycubes.live",
    "http://localhost:3000",
    "http://localhost:3005"};
void writeCORS(auto *req, auto *res) {
    std::string origin(req->getHeader("origin"));
    if (allowed_origins.contains(origin)) {
        res->writeHeader("Access-Control-Allow-Origin", origin);
        res->writeHeader("Access-Control-Allow-Methods", "GET, POST, HEAD, OPTIONS");
        res->writeHeader("Access-Control-Allow-Credentials", "true");
        res->writeHeader("Access-Control-Allow-Headers", "csrf-token, content-type, x-access-token");
    }
}
int main(int argc, char **argv) {

    auto registry = std::make_shared<prometheus::Registry>();
    Metrics metrics(registry);
    GameCoordinator coordinator(&metrics);

    signal_handler = [&]() {
        std::cout << "Caught signal, attempting graceful shutdown..." << std::endl;
        coordinator.save_to_disk();
        exit(0);
    };

    signal(SIGINT, signal_callback_handler);
    signal(SIGTERM, signal_callback_handler);

    int port = DEFAULT_PORT;
    if (argc == 2) {
        // try to read a port as arg 2
        port = atoi(argv[1]);
    }
    try {
        coordinator.load_persistence();
    } catch (const std::exception &e) {
        std::cout << "WARNING: Failed to load server state from persistence!" << std::endl;
        std::cout << e.what() << std::endl;
    }

    std::string authServerUrl("http://auth:3031/server/");
    std::string devAuthServerUrl("http://localhost:3031/server/");

    std::string baseAuthUrl;

    RngServer rng;

    if (std::getenv("DEV")) {
        baseAuthUrl = devAuthServerUrl;
        rng.emplace<BaseRngServer<CppRngServer>>();
    } else {
        baseAuthUrl = authServerUrl;
        rng.emplace<BaseRngServer<FortranRngServer>>();
    }

    auto rolled = roll(rng);
    std::cout << rolled[0] << " " << rolled[1] << std::endl;

    bool auth_enabled = true;
    if (std::getenv("NO_AUTH")) {
        auth_enabled = false;
    }

    JWTVerifier jwt_verifier;

    if (auth_enabled) {
        std::cout << "Selected auth server URL: " << baseAuthUrl << std::endl;
        jwt_verifier.init(baseAuthUrl);
    }

    AuthServerRequestQueue authServer(baseAuthUrl, uWS::Loop::get());

    uWS::App app;
    app.get("/metrics", [&](auto *res, auto *req) {
           const prometheus::TextSerializer serializer;
           auto collected_metrics = registry->Collect();
           res->write(serializer.Serialize(collected_metrics));
           res->end();
       })
        .get("/list", [&](auto *res, auto *req) {
            writeCORS(req, res);
            res->writeHeader("Content-Type", "application/json");
            res->write(coordinator.list_rooms().toString());
            res->end();
        })
        .get("/create", [&](auto *res, auto *req) {
            writeCORS(req, res);
            std::string session = getSession(req);
            bool isPrivate = true;
            if (req->getQuery().find("public") != std::string::npos) {
                isPrivate = false;
                metrics.game_counter_public->Increment();
            } else {
                metrics.game_counter_private->Increment();
            }
            if (session == "") {
                res->end();
            } else {
                res->end(coordinator.createRoom(isPrivate));
            }
        })
        .ws<HomeSocketData>("/ws/list", makeHomeWebsocketBehavior(&app, jwt_verifier, authServer, metrics, coordinator))
        .ws<PerSocketData>("/ws/:mode/:room", makeWebsocketBehavior(&app, jwt_verifier, authServer, metrics, coordinator, rng))
        // This 1 makes it so that the port is not reusable
        // because it SUCKS ASS when the port is reusable and you
        // don't realize the port is reusable and then you have a bad day
        // because an old zombie process of the server is running somewhere
        // on your machine and you don't reboot very frequently and people told
        // you to try rebooting but you didnt because that's just a meme people
        // say, they don't actually mean it (usually), but in this case it would
        // have been a good idea, and anyways yeah just make it 1 instead of 0
        // and you should be fine ok bye
        //
        // p.s. chatpgt says:
        // Remember to reboot periodically as advised, as it can mitigate such issues.
        // Make the adjustment and proceed confidently.
        .listen(port, DONT_REUSE_THE_FUCKING_PORT_LINUX, [port](auto *socket) {
            if (socket) {
                std::cout << "Listening on port " << port << std::endl;
            }
        })
        .run();

    std::cout << "Failed to listen on port " << port << std::endl;
}
