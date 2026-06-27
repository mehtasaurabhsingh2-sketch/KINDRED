const rateLimit = require('express-rate-limit');

// General API rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes',
    error: 'RATE_LIMIT_EXCEEDED'
  }
});

// Stricter rate limiting for AI inference routes to prevent abuse/costs
const aiInferenceLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 15, // Limit each IP to 15 AI requests per minute
  message: {
    success: false,
    message: 'Too many AI requests from this IP, please try again in a minute',
    error: 'RATE_LIMIT_EXCEEDED'
  }
});

module.exports = {
  apiLimiter,
  aiInferenceLimiter
};
