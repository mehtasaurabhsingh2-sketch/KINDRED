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

// Parse CORS_ORIGIN as a comma-separated list, defaulting to localhost
const allowedOrigins = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',').map(url => url.trim())
  : ['http://localhost:5173'];

// 2. CORS (Dynamic Origin Resolution for Vercel)
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Check if the origin matches our explicit allowed list
    if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      return callback(null, true);
    }
    
    // Automatically allow Vercel preview deployments for CI/CD flexibility
    if (origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }

    // If it doesn't match, block it for security
    return callback(new Error('Blocked by CORS policy'), false);
  },
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
