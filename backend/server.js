const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables as early as possible
dotenv.config({ path: path.resolve(__dirname, '.env') });

const healthRoutes = require('./routes/healthRoutes');
const resumeRoutes = require('./routes/resumeRoutes');
const portfolioRoutes = require('./routes/portfolioRoutes');
const coverLetterRoutes = require('./routes/coverLetterRoutes');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const logger = require('./utils/logger');

const app = express();

// Basic environment configuration
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Trust proxy if behind a reverse proxy (common in production)
if (process.env.TRUST_PROXY === 'true' || NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// JSON body parsing
app.use(express.json({ limit: '1mb' }));

// CORS configuration
const allowedOrigins = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, Postman)
    if (!origin) {
      return callback(null, true);
    }

    if (!allowedOrigins.length || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    const error = new Error('Not allowed by CORS');
    error.statusCode = 403;
    return callback(error);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// Simple request logging (can be replaced with a more advanced logger)
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.originalUrl}`);
  next();
});

// Routes
app.use('/api/health', healthRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/coverletter', coverLetterRoutes);

// Root route (optional)
app.get('/', (req, res) => {
  res.json({
    name: 'AI Resume & Portfolio Builder API',
    status: 'running',
    environment: NODE_ENV
  });
});

// 404 handler
app.use(notFound);

// Centralized error handler (must be last)
app.use(errorHandler);

// Start server
const server = app.listen(PORT, () => {
  logger.info(`Server running in ${NODE_ENV} mode on port ${PORT}`);
});

// Graceful shutdown & unhandled errors
process.on('unhandledRejection', err => {
  logger.error('Unhandled Rejection:', err);
  server.close(() => {
    process.exit(1);
  });
});

process.on('uncaughtException', err => {
  logger.error('Uncaught Exception:', err);
  server.close(() => {
    process.exit(1);
  });
});

module.exports = app;

