const authService = require("../services/authService");
const logger = require("../config/loggerApi");

const signup = async (req, res) => {
  try {
    const { username, email, password, firstName, lastName } = req.body;
    if (!username || !email || !password) {
      logger.warn("Signup attempt with missing required fields");
      return res.status(400).json({ error: "Username, email, and password are required" });
    }
    const signupResponse = await authService.signup(username, email, password, firstName, lastName);
    logger.info(`User '${username}' signed up successfully`);
    return res.status(201).json(signupResponse);  // 201 Created
  } catch (error) {
    logger.warn(`Signup failed: ${error.message}`);
    return res.status(400).json({ error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      logger.warn("Login attempt with missing credentials");
      return res
        .status(400)
        .json({ error: "Username and password are required" });
    }

    const loginResponse = await authService.login(username, password);

    // Add this logging here (right after the await)
    console.log('loginResponse:', JSON.stringify(loginResponse, null, 2));
    
    // Then, after the logger.info line
    logger.info(`User '${username}' logged in successfully via Keycloak`);
    console.log('About to send response');
    console.log('Response sent successfully');
    return res.json(loginResponse);
    
  } catch (error) {
    logger.warn(`Login failed for user '${req.body?.username}': ${error.message}`);
    return res.status(401).json({ error: error.message });
  }
};

const verify = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    console.log("verify api:extracted token:", token ? 'Present' : 'Missing');
    if (!token) {
      logger.warn("Token verification requested without Authorization header");
      return res.status(401).json({ error: "No token provided" });
    }
    const verificationResult = await authService.verifyToken(token);
    console.log('Verify API: verificationResult:', JSON.stringify(verificationResult, null, 2));
    console.log('Verify API: About to send res.json');
    logger.info("Token verified successfully");
    
    // NEW: Include new tokens if they were refreshed
    const response = { ...verificationResult };
    if (res.locals.newTokens) {
      response.newTokens = res.locals.newTokens;
    }
    res.json(response);
  } catch (error) {
    logger.warn(`Token verification failed: ${error.message}`);
    res.status(401).json({ error: "Token verification failed", details: error.message });
  }
};

const refresh = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(400).json({ error: "Refresh token required" });

  const newTokens = await authService.refreshTokens(refreshToken);
  res.json(newTokens);
};


const forgotPassword = async (req, res) => {
  try {
    const { usernameOrEmail } = req.body; 
    if (!usernameOrEmail) {
      logger.warn("Forgot password attempt with missing fields");
      return res.status(400).json({ error: "Username or email is required" });
    }
    const result = await authService.forgotPassword(usernameOrEmail);
    logger.info(`Forgot password request for '${usernameOrEmail}'`);
    return res.json(result);
  } catch (error) {
    logger.warn(`Forgot password failed: ${error.message}`);
    return res.status(400).json({ error: error.message });
  
};

  }

  const getUser = async (req, res) => {
  try {
    const { realm } = req.params;
    if (!realm) {
      logger.warn("Get user request missing realm parameter");
      return res.status(400).json({ error: "Realm parameter is required" });
    }
    const filters = {};
    if (req.query.id) filters.id = req.query.id;
    if (req.query.username) filters.username = req.query.username;
    if (!filters.id && !filters.username) {
      logger.warn("Get user request missing id or username");
      return res.status(400).json({ error: "Provide 'id' or 'username' as query parameter" });
    }
    const user = await authService.getUser(realm, filters);
    if (!user) {
      logger.info(`User not found for realm '${realm}' with filters: ${JSON.stringify(filters)}`);
      return res.status(404).json({ error: "User not found" });
    }
    logger.info(`Fetched user '${user.username}' for realm '${realm}'`);
    return res.json({ user });
  } catch (error) {
    logger.warn(`Failed to fetch user for realm '${req.params?.realm}': ${error.message}`);
    return res.status(500).json({ error: error.message });
  }
};

const reset = async (req, res) => {
  try {
    const { username, email } = req.body;
    if (!username || !email) {
      logger.warn("Password reset attempt with missing fields");
      return res.status(400).json({ error: "Username and email are required" });
    }
    const resetResponse = await authService.resetPassword(username, email);
    logger.info(`Password reset initiated for user '${username}'`);
    return res.json(resetResponse);
  } catch (error) {
    logger.warn(`Password reset failed: ${error.message}`);
    return res.status(400).json({ error: error.message });
  }
};

const getUsers = async (req, res) => {
  try {
    const { realm } = req.params;
    if (!realm) {
      logger.warn("Get users request missing realm parameter");
      return res.status(400).json({ error: "Realm parameter is required" });
    }
    const users = await authService.getAllUsers(realm);
    logger.info(`Fetched ${users.length} users for realm '${realm}'`);
    return res.json({ users, count: users.length });
  } catch (error) {
    logger.warn(`Failed to fetch users for realm '${req.params?.realm}': ${error.message}`);
    return res.status(500).json({ error: error.message });
  }
};

module.exports = { login, verify,refresh,getUser,signup,forgotPassword,reset,getUsers };
