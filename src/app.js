/**
 * Anti-Gravity DevOps Platform
 * 
 * A self-healing, auto-scaling, fault-tolerant application that demonstrates
 * modern DevOps practices. Just as anti-gravity resists the pull of falling,
 * this platform resists the pull of failure through automated recovery.
 * 
 * Endpoints:
 * - GET /         : Welcome page with system info
 * - GET /health   : Health check for Kubernetes probes
 * - GET /load     : CPU stress endpoint to trigger HPA scaling
 * - GET /metrics  : Prometheus metrics endpoint
 */

const express = require('express');
const client = require('prom-client');

const app = express();
const PORT = process.env.PORT || 3000;
const HOSTNAME = process.env.HOSTNAME || 'unknown';

// ============================================================================
// PROMETHEUS METRICS SETUP
// ============================================================================

// Create a Registry to register metrics
const register = new client.Registry();

// Add default metrics (CPU, memory, event loop lag, etc.)
client.collectDefaultMetrics({ register });

// Custom metrics for our application
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

// ============================================================================
// MIDDLEWARE
// ============================================================================

// Request timing and metrics middleware
app.use((req, res, next) => {
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

// JSON parsing middleware
app.use(express.json());

// ============================================================================
// ROUTES
// ============================================================================

/**
 * GET /
 * Welcome endpoint with system information
 * 
 * Purpose: Provides a friendly landing page showing the pod information.
 * This helps visualize load balancing when multiple pods are running.
 */
app.get('/', (req, res) => {
  res.json({
    application: 'Anti-Gravity DevOps Platform',
    version: '1.0.0',
    description: 'Self-healing, auto-scaling, fault-tolerant infrastructure',
    hostname: HOSTNAME,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    endpoints: {
      health: '/health - Kubernetes health probes',
      load: '/load?duration=5 - CPU stress test (duration in seconds)',
      metrics: '/metrics - Prometheus metrics'
    }
  });
});

/**
 * GET /health
 * Health check endpoint for Kubernetes liveness and readiness probes
 * 
 * Purpose: Kubernetes uses this to determine if the pod is:
 * - Alive (liveness): Should the pod be restarted?
 * - Ready (readiness): Should traffic be routed to this pod?
 * 
 * A healthy response indicates the application is functioning correctly.
 * Returns 200 OK with health status information.
 */
app.get('/health', (req, res) => {
  const healthStatus = {
    status: 'healthy',
    hostname: HOSTNAME,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
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

/**
 * GET /load
 * CPU stress endpoint to trigger Horizontal Pod Autoscaler (HPA)
 * 
 * Purpose: Simulates CPU-intensive work to demonstrate auto-scaling.
 * When multiple requests hit this endpoint, CPU usage increases,
 * triggering the HPA to create more pod replicas.
 * 
 * Query Parameters:
 * - duration: How long to stress CPU in seconds (default: 5, max: 30)
 * 
 * Usage: curl "http://localhost:3000/load?duration=10"
 * 
 * This is the "gravity" that our "anti-gravity" system fights against.
 * The HPA automatically scales up to handle the load, preventing system failure.
 */
app.get('/load', (req, res) => {
  const duration = Math.min(parseInt(req.query.duration) || 5, 30); // Max 30 seconds
  const startTime = Date.now();
  const endTime = startTime + (duration * 1000);
  
  loadTestsTotal.inc();
  
  console.log(`[LOAD] Starting CPU stress test for ${duration} seconds on ${HOSTNAME}`);
  
  // CPU-intensive calculation (mathematical operations)
  let iterations = 0;
  while (Date.now() < endTime) {
    // Perform CPU-intensive calculations
    for (let i = 0; i < 1000000; i++) {
      Math.sqrt(Math.random() * 999999);
      Math.pow(Math.random(), Math.random());
    }
    iterations++;
  }
  
  const actualDuration = ((Date.now() - startTime) / 1000).toFixed(2);
  
  console.log(`[LOAD] Completed CPU stress test: ${iterations} iterations in ${actualDuration}s`);
  
  res.json({
    status: 'completed',
    hostname: HOSTNAME,
    requestedDuration: duration,
    actualDuration: parseFloat(actualDuration),
    iterations: iterations,
    message: `CPU stress test completed. This simulates the "gravity" that pulls down your system. The HPA (Anti-Gravity) will scale up pods to resist this load.`
  });
});

/**
 * GET /metrics
 * Prometheus metrics endpoint
 * 
 * Purpose: Exposes application metrics in Prometheus format.
 * Prometheus scrapes this endpoint to collect metrics for monitoring.
 * 
 * Metrics exposed:
 * - http_requests_total: Total HTTP requests by method, path, status
 * - http_request_duration_seconds: Request latency histogram
 * - load_tests_total: Number of load tests executed
 * - active_connections: Current active connections
 * - Default Node.js metrics (CPU, memory, event loop, etc.)
 */
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (error) {
    console.error('[METRICS] Error generating metrics:', error);
    res.status(500).end(error.message);
  }
});

/**
 * GET /ready
 * Separate readiness endpoint (optional, can use /health for both)
 * 
 * Purpose: More granular readiness check that could include
 * database connections, external service availability, etc.
 */
app.get('/ready', (req, res) => {
  // In a real application, you might check:
  // - Database connection
  // - Cache connection
  // - External API availability
  
  res.status(200).json({
    ready: true,
    hostname: HOSTNAME,
    timestamp: new Date().toISOString()
  });
});

// ============================================================================
// ERROR HANDLING
// ============================================================================

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
    availableEndpoints: ['/', '/health', '/load', '/metrics', '/ready']
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('[ERROR]', err);
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
    console.log('='.repeat(60));
    console.log('🚀 Anti-Gravity DevOps Platform');
    console.log('='.repeat(60));
    console.log(`📡 Server running on port ${PORT}`);
    console.log(`🏠 Hostname: ${HOSTNAME}`);
    console.log(`⏰ Started at: ${new Date().toISOString()}`);
    console.log('');
    console.log('Available endpoints:');
    console.log(`  GET /         - Welcome & system info`);
    console.log(`  GET /health   - Health check (for K8s probes)`);
    console.log(`  GET /load     - CPU stress test (triggers HPA)`);
    console.log(`  GET /metrics  - Prometheus metrics`);
    console.log(`  GET /ready    - Readiness check`);
    console.log('='.repeat(60));
  });
}

// Export for testing
module.exports = app;
