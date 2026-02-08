// logger.js
const fs = require('fs');
const path = require('path');
const { createLogger, transports, format } = require('winston');

// Create logs directory if it doesn't exist
const logDir = 'logs';
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// Winston logger for errors
const logger = createLogger({
  level: 'error',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.json()
  ),
  transports: [
    new transports.File({ filename: path.join(logDir, 'error.log') })
  ]
});

module.exports = logger;
