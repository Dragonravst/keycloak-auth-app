require("dotenv").config();

const keycloakService=require("../services/keycloakService");
console.log('authService: keycloakService.getAllUsers:', typeof keycloakService.getAllUsers);  // Should log "function"
const { api } = require("./keycloakService");
// Removed: const userRepository = require("../repositories/userRepository");
const logger = require("../config/loggerApi");


const clientId = process.env.KEYCLOAK_CLIENT_ID;
const clientSecret = process.env.KEYCLOAK_CLIENT_SECRET;

const signup = async (username, email, password, firstName = "", lastName = "") => {
  // Basic validation
  if (!username || !email || !password) {
    throw new Error("Username, email, and password are required");
  }
  // Prepare user data for Keycloak (adjust fields as needed)
  const userData = {
    username,
    email,
    enabled: true,  // Enable the user immediately
    emailVerified: false,  // Set to true if you handle verification separately
    firstName,
    lastName,
    credentials: [
      {
        type: "password",
        value: password,
        temporary: false,  // Not a temporary password
      },
    ],
  };
  // Create user in Keycloak
  const createdUser = await keycloakService.createUser(userData);
  // Optionally, trigger email verification (if Keycloak is configured)
  // You could call another Admin API endpoint here, e.g., to send a verification email.
  return {
    message: "User created successfully",
    userId: createdUser.id,  // Keycloak returns the user ID
  };
};

const login = async (username, password) => {
  const tokens = await keycloakService.authenticate(username, password);
  const decoded = keycloakService.decodeToken(tokens.access_token);
  const roles = decoded.realm_access?.roles || [];

  // Removed: No local DB syncing or repository calls
  // (Previously: let localUserLogin = await userRepository.ensureLocalUser(...);)

  return {
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
    user: {
      sub: decoded.sub,
      username,
      roles,
      clientId:decoded.azp,
      // Removed: localUserId and localUserLoginId (no longer relevant)
    },
  };
};

// Rest of the file remains unchanged...
const verifyToken = async (token) => {
  // ... (unchanged)
  const tokenInfo = await keycloakService.verifyToken(token);
  if (!tokenInfo.active) {
    throw new Error("Invalid or expired token");
  }
  const decoded = keycloakService.decodeToken(token);
  return {  // <-- Ensure this 'return' is present
    valid: true,
    user: {
      sub: decoded.sub,
      roles: decoded.realm_access?.roles || [],
      clientId:decoded.azp,
    },
  };
};

const refreshTokens = async (refreshToken) => {
  const params = new URLSearchParams({
    grant_type: "refresh_token",
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: refreshToken,
  });

  const { data } = await api.post("/token", params.toString(), {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });

  // decode new access token
  const decoded = keycloakService.decodeToken(data.access_token);
  const roles = decoded.realm_access?.roles || [];

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresIn: data.expires_in,
    user: {
      sub: decoded.sub,
      username: decoded.preferred_username,
      roles,
      clientId: decoded.azp,
    },
  };
};

const authenticateUser = async (token) => {
  // ... (unchanged)
   const tokenInfo = await keycloakService.verifyToken(token);
    if (!tokenInfo.active) {
      throw new Error("Invalid token");
    }
    const userInfo = await keycloakService.getUserInfo(token);
    const decoded = keycloakService.decodeToken(token);
    return {
      ...userInfo,
      roles: decoded.realm_access?.roles || [],
      clientId:decoded.azp,
    };
};

const checkAuthorization = (user, requiredRoles) => {
  // ... (unchanged)
  if (!user || !user.roles) {
    throw new Error("No roles found");
  }

  const hasRole = user.roles.some(role => requiredRoles.includes(role));

  if (!hasRole) {
    throw new Error("Insufficient permissions");
  }

  return true;
};

const forgotPassword = async (usernameOrEmail) => {
  if (!usernameOrEmail) {
    throw new Error("Username or email is required");
  }
  const result = await keycloakService.sendForgotPasswordEmail(usernameOrEmail);
  return result;
};

const getUser = async (realm, filters = {}) => {
  if (!realm) {
    throw new Error("Realm is required");
  }
  return await keycloakService.getUser(realm, filters);
};

const resetPassword = async (username, email) => {
  if (!username || !email) {
    throw new Error("Username and email are required");
  }
  const user = await keycloakService.getUserByUsername(username);
  if (!user) {
    throw new Error("User not found");
  }
  if (user.email !== email) {
    throw new Error("Username and email do not match");
  }
  await keycloakService.sendPasswordResetEmail(user.id);
  return { message: `Password reset email sent to ${email}` };
};

const getAllUsers = async (realm) => {
  if (!realm) {
    throw new Error("Realm is required");
  }
  return await keycloakService.getAllUsers(realm);
};

module.exports = {
  signup,
  login,
  verifyToken,
  authenticateUser,
  checkAuthorization,
  refreshTokens,
  forgotPassword,
  getUser,
  resetPassword,
  getAllUsers,
};