const authService = require("../services/authService");

// const authenticate = async (req, res, next) => {
//   try {
//     const token = req.headers.authorization?.split(" ")[1];

//     if (!token) {
//       return res.status(401).json({ error: "No token provided" });
//     }

//     const user = await authService.authenticateUser(token);
//     req.user = user;
//     next();
//   } catch (error) {
//     res.status(401).json({ 
//       error: "Authentication failed", 
//       details: error.message 
//     });
//   }
// };


const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1];
  const refreshToken = req.headers["x-refresh-token"];
  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }
  try {
    const tokenInfo = await authService.verifyToken(token);
    if (tokenInfo.active) {
      return next();
    }
    // If access token is inactive AND no refresh token
    if (!refreshToken) {
      return res.status(401).json({ error: "Token expired, refresh_token missing" });
    }
    // Refresh token
    const newTokens = await authService.refreshTokens(refreshToken);
    req.newTokens = newTokens;
    req.headers.authorization = `Bearer ${newTokens.accessToken}`;
    
    // NEW: Attach new tokens to the response so the client gets them
    res.locals.newTokens = newTokens;  // Use res.locals to pass to the controller
    return next();
  } catch (err) {
    return res.status(401).json({ error: "Auth failed", details: err.message });
  }
};

const authorize = (roles) => {
  return (req, res, next) => {
    try {
      authService.checkAuthorization(req.user, roles);
      next();
    } catch (error) {
      res.status(403).json({ 
        error: error.message 
      });
    }
  };
};

module.exports = { authenticate, authorize };