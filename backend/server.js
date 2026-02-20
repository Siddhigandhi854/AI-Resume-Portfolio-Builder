const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

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

// JSON body parsing
app.use(express.json({ limit: '1mb' }));

// Simple CORS - allow everything
app.use(cors());

// Simple request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.originalUrl}`);
  next();
});

// Routes
app.use('/api/health', healthRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/coverletter', coverLetterRoutes);

// Root route
app.get('/', (req, res) => {
  res.send('Server is running!');
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
  console.error('Unhandled Rejection:', err);
  server.close(() => {
    process.exit(1);
  });
});

process.on('uncaughtException', err => {
  console.error('Uncaught Exception:', err);
  server.close(() => {
    process.exit(1);
  });
});

module.exports = app;

