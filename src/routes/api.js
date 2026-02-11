const express = require('express');
const client = require('prom-client');
const logger = require('../logger');
const redis = require('../redis');

const router = express.Router();
const register = new client.Registry();

// Add default metrics
client.collectDefaultMetrics({ register });

// Custom metrics
const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'path', 'status'],
  registers: [register]
});

const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'path'],
  buckets: [0.001, 0.005, 0.015, 0.05, 0.1, 0.5, 1, 5],
  registers: [register]
});

const loadTestsTotal = new client.Counter({
  name: 'load_tests_total',
  help: 'Total number of load test requests',
  registers: [register]
});

const activeConnections = new client.Gauge({
  name: 'active_connections',
  help: 'Number of active connections',
  registers: [register]
});

// Middleware to track metrics
router.use((req, res, next) => {
  const start = Date.now();
  activeConnections.inc();
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    httpRequestsTotal.inc({ method: req.method, path: req.path, status: res.statusCode });
    httpRequestDuration.observe({ method: req.method, path: req.path }, duration);
    activeConnections.dec();
  });
  
  next();
});

const fs = require('fs');
const path = require('path');

const HOSTNAME = process.env.HOSTNAME || 'unknown';

router.get('/api', (req, res) => {
  res.json({
    application: 'Anti-Gravity DevOps Platform',
    version: '1.0.0',
    description: 'Self-healing, auto-scaling, fault-tolerant infrastructure',
    hostname: HOSTNAME,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    endpoints: {
      dashboard: '/ - Visual Dashboard',
      api: '/api - System info (JSON)',
      health: '/health - Kubernetes health probes',
      load: '/load?duration=5 - CPU stress test (duration in seconds)',
      metrics: '/metrics - Prometheus metrics',
      logs: '/api/logs - Recent server logs'
    }
  });
});

router.get('/api/logs', (req, res) => {
  const logFile = path.join(__dirname, '../../combined.log');
  
  if (fs.existsSync(logFile)) {
    // Read last 100 lines - simplified approach for demo
    const data = fs.readFileSync(logFile, 'utf8');
    const lines = data.split('\n').filter(line => line.length > 0).slice(-100).reverse();
    res.json(lines.map(line => {
      try {
        return JSON.parse(line);
      } catch (e) {
        return { message: line, timestamp: new Date().toISOString() };
      }
    }));
  } else {
    res.json([{ message: 'No logs found yet.', timestamp: new Date().toISOString() }]);
  }
});


router.get('/health', async (req, res) => {
  let survivorCount = 0;
  try {
    // Increment a counter that survives pod restarts
    survivorCount = await redis.incr('survivor_count');
  } catch (e) {
    // Ignore redis errors
  }

  const healthStatus = {
    status: 'healthy',
    hostname: HOSTNAME,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    survivorCount: survivorCount, // Show this in the UI to prove persistence
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB'
    },
    checks: {
      server: 'running',
      memory: process.memoryUsage().heapUsed < 500 * 1024 * 1024 ? 'ok' : 'warning'
    }
  };
  
  res.status(200).json(healthStatus);
});

router.get('/load', (req, res) => {
  const duration = Math.min(parseInt(req.query.duration) || 5, 30);
  const startTime = Date.now();
  const endTime = startTime + (duration * 1000);
  
  loadTestsTotal.inc();
  
  logger.info(`[LOAD] Starting CPU stress test for ${duration} seconds on ${HOSTNAME}`);
  
  let iterations = 0;
  while (Date.now() < endTime) {
    for (let i = 0; i < 1000000; i++) {
      Math.sqrt(Math.random() * 999999);
      Math.pow(Math.random(), Math.random());
    }
    iterations++;
  }
  
  const actualDuration = ((Date.now() - startTime) / 1000).toFixed(2);
  
  logger.info(`[LOAD] Completed CPU stress test: ${iterations} iterations in ${actualDuration}s`);
  
  res.json({
    status: 'completed',
    hostname: HOSTNAME,
    requestedDuration: duration,
    actualDuration: parseFloat(actualDuration),
    iterations: iterations,
    message: `CPU stress test completed. This simulates the "gravity" that pulls down your system. The HPA (Anti-Gravity) will scale up pods to resist this load.`
  });
});

router.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (error) {
    logger.error('[METRICS] Error generating metrics:', error);
    res.status(500).end(error.message);
  }
});

router.get('/ready', (req, res) => {
  res.status(200).json({
    ready: true,
    hostname: HOSTNAME,
    timestamp: new Date().toISOString()
  });
});

// Chaos Endpoints
router.post('/chaos/kill', (req, res) => {
  logger.warn('CHAOS: Killing process via API request');
  res.json({ status: 'dying', message: 'Goodbye cruel world! (Process terminating)' });
  
  // Delay slightly to allow response to be sent
  setTimeout(() => {
    process.exit(1);
  }, 100);
});

module.exports = router;
