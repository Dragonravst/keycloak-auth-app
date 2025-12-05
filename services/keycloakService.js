const axios = require("axios");
const jwt = require("jsonwebtoken");
require("dotenv").config();

// Keycloak base config
const authBase = `${process.env.KEYCLOAK_URL}/realms/${process.env.KEYCLOAK_REALM}/protocol/openid-connect`;
const clientId = process.env.KEYCLOAK_CLIENT_ID;
const clientSecret = process.env.KEYCLOAK_CLIENT_SECRET;
const adminBase = `${process.env.KEYCLOAK_URL}/admin/realms/${process.env.KEYCLOAK_REALM}`;

// Axios Instance
const api = axios.create({
  baseURL: authBase,
  timeout: 5000,
});
const adminApi = axios.create({
  baseURL: adminBase,
  timeout: 5000,
});

// Centralized Error Handler
const handleError = (method, err) => {
  console.error(`KeycloakService - ${method} Error:`, err);

  if (err.response) {
    throw new Error(
      err.response.data?.error_description ||
        JSON.stringify(err.response.data)
    );
  }

  if (err.request) {
    throw new Error("No response received from Keycloak");
  }

  throw new Error(err.message || "Unknown Keycloak error");
};

const getAdminToken = async () => {
  try {
    const params = new URLSearchParams({
      grant_type: "client_credentials",
      client_id: process.env.KEYCLOAK_ADMIN_CLIENT_ID,
      client_secret: process.env.KEYCLOAK_ADMIN_CLIENT_SECRET,
    });
    const { data } = await api.post("/token", params.toString(), {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
    return data.access_token;
  } catch (err) {
    handleError("getAdminToken", err);
  }
};
// Create User (via Admin API)
const createUser = async (userData) => {
  try {
    const adminToken = await getAdminToken();
    const { data } = await adminApi.post("/users", userData, {
      headers: {
        Authorization: `Bearer ${adminToken}`,
        "Content-Type": "application/json",
      },
    });
    return data;  // Keycloak returns the created user ID or details
  } catch (err) {
    handleError("createUser", err);
  }
};

// Decode Token
const decodeToken = (token) => {
  try {
    return jwt.decode(token);
  } catch (err) {
    handleError("decodeToken", err);
  }
};

// Authenticate User
const authenticate = async (username, password) => {
  try {
    const params = new URLSearchParams({
      grant_type: "password",
      client_id: clientId,
      client_secret: clientSecret,
      username,
      password,
    });

    const { data } = await api.post("/token", params.toString(), {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
    console.log('Keycloak authenticate response:', data);
    return data;
  } catch (err) {
    handleError("authenticate", err);
  }
};

// Verify Token
const verifyToken = async (token) => {
  try {
    const params = new URLSearchParams({
      token,
      client_id: clientId,
      client_secret: clientSecret,
    });

    const { data } = await api.post("/token/introspect", params.toString(), {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    return data;
  } catch (err) {
    handleError("verifyToken", err);
  }
};

// Get User Info
const getUserInfo = async (accessToken) => {
  try {
    const { data } = await api.get("/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    return data;
  } catch (err) {
    handleError("getUserInfo", err);
  }
};
//users
const sendForgotPasswordEmail = async (usernameOrEmail) => {
  if (!usernameOrEmail) {
    throw new Error("Username or email is required");
  }
  const forgotPasswordUrl = `${authBase}/login-actions/reset-credentials?client_id=${clientId}&tab=login`;  // 'tab=login' ensures it's the login page
  return {
    redirectUrl: forgotPasswordUrl,
    message: "Redirecting to password reset page. Enter your username/email there to receive a reset email."
  };
};

const getUserByUsername = async (username) => {
  try {
    const adminToken = await getAdminToken();
    const { data } = await adminApi.get(`/users?username=${encodeURIComponent(username)}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    return data.length > 0 ? data[0] : null;  // Return first match (usernames are unique)
  } catch (err) {
    handleError("getUserByUsername", err);
  }
};

const getUser = async (realm, filters = {}) => {
  try {
    const adminToken = await getAdminToken();
    let data;
    if (filters.id) {
      // Fetch by ID
      const { data: userData } = await axios.get(`${process.env.KEYCLOAK_URL}/admin/realms/${realm}/users/${filters.id}`, {
        headers: {
          Authorization: `Bearer ${adminToken}`,
          "Content-Type": "application/json",
        },
      });
      data = userData;
    } else if (filters.username) {
      const queryParams = new URLSearchParams({ username: filters.username }).toString();
      const { data: users } = await axios.get(`${process.env.KEYCLOAK_URL}/admin/realms/${realm}/users?${queryParams}`, {
        headers: {
          Authorization: `Bearer ${adminToken}`,
          "Content-Type": "application/json",
        },
      });
      data = users.length > 0 ? users[0] : null; 
    } else {
      throw new Error("Provide either 'id' or 'username' in filters");
    }
    return data;  
  } catch (err) {
    handleError("getUser", err);
  }
};

//admins
const sendPasswordResetEmail = async (userId) => {
  try {
    const adminToken = await getAdminToken();
    await adminApi.put(`/users/${userId}/execute-actions-email`, ["UPDATE_PASSWORD"], {
      headers: {
        Authorization: `Bearer ${adminToken}`,
        "Content-Type": "application/json",
      },
    });
    // No data returned; success if no error
  } catch (err) {
    handleError("sendPasswordResetEmail", err);
  }
};

const getAllUsers = async (realm) => {
  try {
    const adminToken = await getAdminToken();
    const { data } = await axios.get(`${process.env.KEYCLOAK_URL}/admin/realms/${realm}/users`, {
      headers: {
        Authorization: `Bearer ${adminToken}`,
        "Content-Type": "application/json",
      },
    });
    return data;  
  } catch (err) {
    handleError("getAllUsers", err);
  }
};


module.exports = {
  decodeToken,
  authenticate,
  verifyToken,
  getUserInfo,
  api,
  createUser,
  sendForgotPasswordEmail,
  getUserByUsername,
  getUser,
  sendPasswordResetEmail,
  getAllUsers,
};
console.log('keycloakService module loaded. getAllUsers:', typeof module.exports.getAllUsers);  // Should log "function"