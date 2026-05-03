import { createLogger, format, transports } from "winston";

const logger = createLogger({
  level: process.env.LOG_LEVEL || "info",
  format:
    process.env.NODE_ENV === "production"
      ? format.combine(format.timestamp(), format.json())
      : format.combine(format.colorize(), format.simple()),
  transports: [new transports.Console()],
});

export default logger;
