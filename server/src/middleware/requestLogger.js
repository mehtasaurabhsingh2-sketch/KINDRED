const { v4: uuidv4 } = require('uuid');

/**
 * Middleware to generate a unique request ID for tracing and logging.
 */
const requestLogger = (req, res, next) => {
  req.requestId = uuidv4();
  // Optional: Set header so client can trace the request ID
  res.setHeader('X-Request-ID', req.requestId);
  next();
};

module.exports = requestLogger;
