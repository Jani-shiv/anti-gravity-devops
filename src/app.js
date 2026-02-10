/**
 * Anti-Gravity DevOps Platform
 * 
 * A self-healing, auto-scaling, fault-tolerant application that demonstrates
 * modern DevOps practices.
 */

// Initialize tracing before anything else
require('./tracing');

const express = require('express');
const path = require('path');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const logger = require('./logger');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 3000;
const HOSTNAME = process.env.HOSTNAME || 'unknown';

// ============================================================================
// MIDDLEWARE
// ============================================================================

// Security Middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disabled for simplicity with inline scripts/styles if any
}));
app.use(cors());

// Rate Limiting (skip for health/metrics endpoints used by monitoring)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => ['/health', '/ready', '/metrics'].includes(req.path),
});
app.use(limiter);

// Logging Middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.originalUrl}`, {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip
  });
  next();
});

// JSON parsing
app.use(express.json());

// ============================================================================
// DOCUMENTATION
// ============================================================================
const swaggerDocument = YAML.load(path.join(__dirname, 'swagger.yaml'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// ============================================================================
// ROUTES
// ============================================================================

// Serve static files from public directory
app.use(express.static(path.join(__dirname, '../public')));

// API Routes (mount at root level to preserve existing paths like /health, /load, etc.)
app.use('/', apiRoutes);

// ============================================================================
// ERROR HANDLING
// ============================================================================

// 404 handler
app.use((req, res) => {
  logger.warn(`404 Not Found: ${req.method} ${req.path}`);
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
    availableEndpoints: ['/', '/health', '/load', '/metrics', '/ready', '/api-docs']
  });
});

// Global error handler
app.use((err, req, res, next) => {
  logger.error('Internal Server Error', { error: err.message, stack: err.stack });
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' ? 'An error occurred' : err.message
  });
});

// ============================================================================
// SERVER STARTUP
// ============================================================================

// Only start server if not in test mode
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    // Using simple console logs for startup/banner as it looks better in terminal
    console.log('='.repeat(60));
    console.log('🚀 Anti-Gravity DevOps Platform');
    console.log('='.repeat(60));
    console.log(`📡 Server running on port ${PORT}`);
    console.log(`🏠 Hostname: ${HOSTNAME}`);
    console.log(`Docs available at http://localhost:${PORT}/api-docs`);
    console.log('='.repeat(60));
    
    logger.info('Server started', { port: PORT, hostname: HOSTNAME });
  });
}

// Export for testing
module.exports = app;
