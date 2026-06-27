const { logError } = require('../utils/logger');

/**
 * Centralized error handling middleware.
 * Enforces a strict JSON format: { success, message, data, error }
 */
const errorHandler = (err, req, res, next) => {
  // Log the error securely
  logError('Unhandled Error', err, {
    requestId: req.requestId,
    userId: req.user?.uid || 'anonymous',
    route: req.originalUrl,
  });

  const statusCode = err.statusCode || 500;
  const message = err.isOperational ? err.message : 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    message,
    data: null,
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

module.exports = errorHandler;
