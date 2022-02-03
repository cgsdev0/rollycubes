#include "JWTVerifier.h"
#include <json.hpp>
#include <memory>
#define JWT_DISABLE_PICOJSON true
#include <defaults.h>

struct JWTVerifier::VerifierImpl {
    VerifierImpl() : initialized(false), verifier(jwt::default_clock()) {}

    bool initialized;
    jwt::verifier<jwt::default_clock, jwt::traits::nlohmann_json> verifier;
};
JWTVerifier::JWTVerifier() : impl(new VerifierImpl) {
}

JWTVerifier::~JWTVerifier() {
    delete impl;
}

void JWTVerifier::init() {
    // TODO: fetch this from http://localhost:3031/public_key
    std::string public_key = R"(-----BEGIN PUBLIC KEY-----
MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEAxAs+hVnJOO08u2yB2d1/
z8kooCSeweTc+Z1yAQvoIYIT7F67OXNiuS5Fhq5Q5hiQY71sh+rGKK72GyjQ1OM7
eEnGpuZyMEhrnCPEvBnoSJett0gxLqiqFytUK96k8x/b9okcNs2B21T0zLRGGOoZ
X1Anq4LOQDJ8ZHKel3+nLsmo9ertEs6CfMJfewgoRXhJSWxONSv1wSHIMPNyo1VK
UG2/yVN9n/F1aRn+DBvG7OpnYS1RIlGwSz6ab1DBbwrznxPl8l/+u43xbL4n5PLe
xwP5I4324dyO4teV5TiX0C2/OSv2D2aFIKDpTkcm6+0KnQIuIbNvzY1RaoDB1Oy1
FkGm+FHGn/PtasqU7GXK3rDry75EDcWOnkVn41/AgBEzTp7oRRNAtIGAmAhfLTHP
KSjmTC/blI+eosSuULQ58tEdZSauZXka5l43ikQMWERtMd8nIrLZaLFG/WCDypqm
gics4A0uoucodwHqkd/wdOn9nbNCGj8ruhJXJFi++dejEZRUybMhAOLf6oAMS/6k
wD5UbFt1UoZuMHSzEUzcKaLpoCCjNg6Jxc5VTBHuTuzNiHJ8AULw6CfrUjO3yJ9I
/sDRNfe0wnJbvGLYNzeXi5AxBacfqkiUD4cAZExkPKi2gGyNzyH7Jem+Yd/a7pAQ
p0UHBGyVNjRYF86YetoiFisCAwEAAQ==
-----END PUBLIC KEY-----)";
    impl->verifier.allow_algorithm(jwt::algorithm::rs256(public_key, "", "", ""));
    impl->initialized = true;
}

ValidClaim JWTVerifier::decode_and_verify(const std::string &token) const {
    if (!impl->initialized) throw std::runtime_error("JWT verifier has not been initialized!");
    ValidClaim claim;
    try {
        auto decoded = jwt::decode(token);
        impl->verifier.verify(decoded);
        auto claims = decoded.get_payload_claims();
        claim.user_id = claims["user_id"].to_json().get<std::string>();
        claim.display_name = claims["display_name"].to_json().get<std::string>();
    } catch (const jwt::error::signature_verification_exception &e) {
        throw std::runtime_error(e.what());
    } catch (const jwt::error::token_verification_exception &e) {
        throw std::runtime_error(e.what());
    }
    return claim;
}