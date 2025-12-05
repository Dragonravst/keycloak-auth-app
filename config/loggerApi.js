/**
 * created logger file using winston npm package.
 */

const winston = require("winston");
const { createLogger, transports, format } = winston;
const DailyRotateFile = require("winston-daily-rotate-file");

const customFormat = format.combine(
  format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  format.printf((info) => {
    return `${info.timestamp} - [${info.level.toUpperCase().padEnd(10)}] - ${
      info.message
    }`;
  })
);

// Define the logger
const logger = createLogger({
  level: "silly",
  format: customFormat,
  defaultMeta: { service: "my-app" },
  transports: [
    new DailyRotateFile({
      filename: "logs/gerlinHealth-mlmg-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      zippedArchive: false,
      maxSize: "50m",
      // maxFiles: '14d'
    }),
  ],
});

module.exports = logger;

// // Log some messages
logger.error("An error occurred");
logger.warn("A warning message");
logger.info("Some information");
logger.debug("Debug Message");
logger.silly("Debug Message");
