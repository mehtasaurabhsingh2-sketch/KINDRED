const app = require('./app');
const { logInfo, logError } = require('./utils/logger');

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  logInfo(`Kindred Backend server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logError('Unhandled Rejection', err);
  // Close server & exit process
  server.close(() => process.exit(1));
});
