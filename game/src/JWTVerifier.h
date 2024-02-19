#pragma once

#include <string>

struct ValidClaim {
    std::string user_id;
    std::string display_name;
};

struct JWTVerifier {

    JWTVerifier();
    ~JWTVerifier();

    // Must be called in order to fetch public key.
    void init(const std::string &baseUrl);

    ValidClaim decode_and_verify(const std::string &token) const;

  private:
    class VerifierImpl;
    VerifierImpl *impl;
};
