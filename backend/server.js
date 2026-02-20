const express = require('express');
const cors = require('cors');
const path = require('path');

const healthRoutes = require('./routes/healthRoutes');
const resumeRoutes = require('./routes/resumeRoutes');
const portfolioRoutes = require('./routes/portfolioRoutes');
const coverLetterRoutes = require('./routes/coverLetterRoutes');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const logger = require('./utils/logger');

const app = express();

// Basic configuration
const PORT = process.env.PORT || 5000;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyDdiCmw3G42Boao_Bl0kV15g57B0VGeNe0';

// Trust proxy for production
app.set('trust proxy', 1);

// JSON body parsing
app.use(express.json({ limit: '1mb' }));

// CORS configuration - allow all origins for simplicity
const corsOptions = {
  origin: true,
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
    environment: 'production'
  });
});

// 404 handler
app.use(notFound);

// Centralized error handler (must be last)
app.use(errorHandler);

// Start server
const server = app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
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

