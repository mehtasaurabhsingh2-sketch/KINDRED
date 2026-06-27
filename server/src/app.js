const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');

// Load environment variables early
dotenv.config();

const { morganMiddleware } = require('./utils/logger');
const requestLogger = require('./middleware/requestLogger');
const errorHandler = require('./middleware/errorHandler');
const routes = require('./routes');

const app = express();

// 1. Security Headers
app.use(helmet());

// 2. CORS (Allow only specific frontend origin)
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 3. Body Parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 4. Request IDs (must be before logger)
app.use(requestLogger);

// 5. Logging
app.use(morganMiddleware);

// 6. Routes
app.use('/', routes);

// 7. Global Error Handler (must be last)
app.use(errorHandler);

module.exports = app;
