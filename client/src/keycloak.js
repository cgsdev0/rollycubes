import Keycloak from "keycloak-js";

const keycloakConfig = {
  url: "https://rollycubes.com/auth",
  realm: "rollycubes",
  clientId: "game-client",
};

const devKeycloakConfig = {
  url: "http://localhost:8080/auth",
  realm: "rollycubes",
  clientId: "game-client",
};

const keycloak = new Keycloak(
  process.env.NODE_ENV === "development" ? devKeycloakConfig : keycloakConfig
);
export default keycloak;
