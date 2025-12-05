// Minimal auth-only service: login with Keycloak and verify JWT
const express = require("express");
const cors = require("cors");
require("dotenv/config");

const logger = require("./config/loggerApi");

const app = express();

// CORS + body parsing
const corsOpts = {
  origin: "*",
  methods: ["GET", "POST", "PUT"],
  allowedHeaders: [
    "Accept",
    "Content-Type",
    "Authorization",
    "X-Requested-With",
  ],
};

app.use(cors(corsOpts));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic request logger for production visibility
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    logger.info(
      `${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`
    );
  });
  next();
});

// Auth routes (login, verify)
const authRoutes = require("./v1/routes/authRoutes");
app.use("/api/v1/auth", authRoutes);

// Simple health check
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Port
const PORT = process.env.PORT || 8080;

// Server
app.listen(PORT, (error) => {
  if (!error) {
    logger.info(`Auth server is running on port ${PORT}`);
  } else {
    logger.error(`Error occurred, server can't start: ${error.message}`);
  }
});

module.exports = app;
