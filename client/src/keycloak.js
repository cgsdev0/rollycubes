import Keycloak from "keycloak-js";

const keycloakConfig = {
  url: "https://rollycubes.com/auth",
  realm: "rollycubes",
  clientId: "game-client",
};

const keycloak = new Keycloak(keycloakConfig);
export default keycloak;
