#include "JWTVerifier.h"
#include <iostream>
#include <json.hpp>
#include <memory>
#define JWT_DISABLE_PICOJSON true
#include <defaults.h>

#include "HTTPClient.h"

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

void JWTVerifier::init(const std::string &baseUrl) {
    auto public_key_resp = http::get(baseUrl + "public_key");
    auto j = nlohmann::json::parse(public_key_resp);
    auto public_key = j["publicKey"].get<std::string>();

    impl->verifier.allow_algorithm(jwt::algorithm::rs256(public_key, "", "", ""))
        .leeway(60);
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