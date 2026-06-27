const morgan = require('morgan');

// Standard console logging wrapper for backend logs
// Avoids logging raw prompts or sensitive data
const logInfo = (message, meta = {}) => {
  console.log(JSON.stringify({
    level: 'INFO',
    timestamp: new Date().toISOString(),
    message,
    ...meta
  }));
};

const logError = (message, error, meta = {}) => {
  console.error(JSON.stringify({
    level: 'ERROR',
    timestamp: new Date().toISOString(),
    message,
    error: error?.message || error,
    ...meta
  }));
};

// Morgan HTTP request logger configured for privacy
// Logs latency, route, status, etc., but avoids request bodies.
const morganMiddleware = morgan((tokens, req, res) => {
  return JSON.stringify({
    level: 'HTTP',
    timestamp: new Date().toISOString(),
    method: tokens.method(req, res),
    url: tokens.url(req, res),
    status: tokens.status(req, res),
    responseTime: tokens['response-time'](req, res) + ' ms',
    requestId: req.requestId, // Unique ID added by requestLogger middleware
    userId: req.user?.uid || 'anonymous' // Avoid logging PII like email
  });
});

module.exports = {
  logInfo,
  logError,
  morganMiddleware
};
