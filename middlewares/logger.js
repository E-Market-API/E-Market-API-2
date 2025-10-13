// middlewares/logger.js
import fs from "fs";
import path from "path";
import chalk from "chalk"; // For colored console output

// Ensure logs directory exists
const logDir = path.join(process.cwd(), "logs");
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const logFile = path.join(logDir, "requests.log");

const logger = (req, res, next) => {
  const start = Date.now(); // Track response time

  // When response finishes
  res.on("finish", () => {
    const duration = Date.now() - start;
    const now = new Date().toISOString();
    const { method, originalUrl } = req;
    const { statusCode } = res;
    const ip = req.ip || req.connection.remoteAddress;

    // Color coding for console
    const statusColor =
      statusCode >= 500 ? chalk.red :
      statusCode >= 400 ? chalk.yellow :
      statusCode >= 300 ? chalk.cyan :
      chalk.green;

    const logLine = `[${now}] ${method} ${originalUrl} ${statusCode} ${duration}ms ${ip}\n`;

    // Console output
    console.log(
      `[${chalk.gray(now)}] ${chalk.blue(method)} ${chalk.magenta(originalUrl)} ${statusColor(statusCode)} ${chalk.white(duration + "ms")} ${chalk.gray(ip)}`
    );

    // Append to log file
    fs.appendFile(logFile, logLine, (err) => {
      if (err) console.error("Error writing to log file:", err);
    });
  });

  next();
};

export default logger;