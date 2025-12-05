const Keycloak = require('keycloak-connect');
const session = require('express-session');

let keycloak;

function initKeycloak() {
    if (!keycloak) {
        keycloak = new Keycloak({ store: new session.MemoryStore() }, {
            "realm": process.env.KEYCLOAK_REALM,
            "auth-server-url": process.env.KEYCLOAK_URL,
            "ssl-required": "external",
            "resource": process.env.KEYCLOAK_CLIENT_ID,
            "credentials": {
                "secret": process.env.KEYCLOAK_CLIENT_SECRET
            },
            "confidential-port": 0,
            "policy-enforcer": {}
        });
    }
    return keycloak;
}

module.exports = initKeycloak;