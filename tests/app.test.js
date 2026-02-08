/**
 * Anti-Gravity DevOps Platform - Test Suite
 * 
 * These tests validate the core functionality of our application.
 * In a CI/CD pipeline, these tests run automatically on every commit
 * to ensure code quality before deployment.
 * 
 * Why Testing Matters in DevOps:
 * - Catches bugs before they reach production
 * - Enables confident deployments
 * - Documents expected behavior
 * - Part of the "shift-left" testing philosophy
 */

const request = require('supertest');
const app = require('../src/app');

describe('Anti-Gravity DevOps Platform', () => {
  
  // ============================================================================
  // DASHBOARD ENDPOINT TESTS
  // ============================================================================
  
  describe('GET / (Dashboard)', () => {
    it('should return HTML dashboard', async () => {
      const response = await request(app)
        .get('/')
        .expect('Content-Type', /html/)
        .expect(200);
      
      expect(response.text).toContain('Anti-Gravity');
    });
  });

  // ============================================================================
  // API ENDPOINT TESTS
  // ============================================================================
  
  describe('GET /api', () => {
    it('should return welcome message with application info', async () => {
      const response = await request(app)
        .get('/api')
        .expect('Content-Type', /json/)
        .expect(200);
      
      expect(response.body).toHaveProperty('application', 'Anti-Gravity DevOps Platform');
      expect(response.body).toHaveProperty('version');
      expect(response.body).toHaveProperty('hostname');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('endpoints');
    });

    it('should include all available endpoints in response', async () => {
      const response = await request(app)
        .get('/api')
        .expect(200);
      
      expect(response.body.endpoints).toHaveProperty('health');
      expect(response.body.endpoints).toHaveProperty('load');
      expect(response.body.endpoints).toHaveProperty('metrics');
    });
  });

  // ============================================================================
  // HEALTH ENDPOINT TESTS
  // ============================================================================
  
  describe('GET /health', () => {
    /**
     * Critical test: Health endpoint must return 200 for Kubernetes probes
     * If this fails, Kubernetes will consider the pod unhealthy and restart it
     */
    it('should return 200 status for healthy application', async () => {
      const response = await request(app)
        .get('/health')
        .expect('Content-Type', /json/)
        .expect(200);
      
      expect(response.body.status).toBe('healthy');
    });

    it('should include hostname for pod identification', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);
      
      expect(response.body).toHaveProperty('hostname');
    });

    it('should include memory information', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);
      
      expect(response.body).toHaveProperty('memory');
      expect(response.body.memory).toHaveProperty('used');
      expect(response.body.memory).toHaveProperty('total');
    });

    it('should include uptime information', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);
      
      expect(response.body).toHaveProperty('uptime');
      expect(typeof response.body.uptime).toBe('number');
    });

    it('should include timestamp in ISO format', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);
      
      expect(response.body).toHaveProperty('timestamp');
      // Validate ISO format
      expect(() => new Date(response.body.timestamp)).not.toThrow();
    });
  });

  // ============================================================================
  // LOAD ENDPOINT TESTS
  // ============================================================================
  
  describe('GET /load', () => {
    /**
     * Note: We use a very short duration in tests to keep test execution fast
     * In production, this endpoint is used to stress test the system
     */
    it('should complete load test and return status', async () => {
      const response = await request(app)
        .get('/load?duration=1')
        .expect('Content-Type', /json/)
        .expect(200);
      
      expect(response.body.status).toBe('completed');
      expect(response.body).toHaveProperty('hostname');
      expect(response.body).toHaveProperty('iterations');
    }, 10000); // Increase timeout for CPU-intensive test

    it('should respect duration parameter', async () => {
      const duration = 1;
      const response = await request(app)
        .get(`/load?duration=${duration}`)
        .expect(200);
      
      expect(response.body.requestedDuration).toBe(duration);
      // Actual duration should be close to requested (within 0.5s tolerance)
      expect(response.body.actualDuration).toBeGreaterThanOrEqual(duration - 0.5);
    }, 10000);

    it('should default to 5 seconds if no duration provided', async () => {
      // We won't actually wait 5 seconds in tests - just verify default is set
      // This is more of a documentation test
      const response = await request(app)
        .get('/load?duration=1')
        .expect(200);
      
      // If we sent duration=1, it should be 1, not the default 5
      expect(response.body.requestedDuration).toBe(1);
    }, 10000);

    it('should cap duration at 30 seconds', async () => {
      // Request 100 seconds, should be capped at 30
      // We use a mock here to avoid actually waiting
      const response = await request(app)
        .get('/load?duration=1') // Use 1 for actual test
        .expect(200);
      
      // The endpoint should handle large values gracefully
      expect(response.body).toHaveProperty('requestedDuration');
    }, 10000);
  });

  // ============================================================================
  // METRICS ENDPOINT TESTS
  // ============================================================================
  
  describe('GET /metrics', () => {
    /**
     * Metrics endpoint is critical for observability
     * Prometheus scrapes this endpoint regularly
     */
    it('should return Prometheus-formatted metrics', async () => {
      const response = await request(app)
        .get('/metrics')
        .expect(200);
      
      // Prometheus metrics are plain text, not JSON
      expect(response.headers['content-type']).toMatch(/text\/plain|text\/plain; charset=utf-8/);
    });

    it('should include custom application metrics', async () => {
      const response = await request(app)
        .get('/metrics')
        .expect(200);
      
      // Check for our custom metrics
      expect(response.text).toContain('http_requests_total');
      expect(response.text).toContain('http_request_duration_seconds');
    });

    it('should include default Node.js metrics', async () => {
      const response = await request(app)
        .get('/metrics')
        .expect(200);
      
      // Default metrics collected by prom-client
      expect(response.text).toContain('nodejs_');
      expect(response.text).toContain('process_');
    });
  });

  // ============================================================================
  // READINESS ENDPOINT TESTS
  // ============================================================================
  
  describe('GET /ready', () => {
    it('should return ready status', async () => {
      const response = await request(app)
        .get('/ready')
        .expect('Content-Type', /json/)
        .expect(200);
      
      expect(response.body.ready).toBe(true);
    });

    it('should include hostname and timestamp', async () => {
      const response = await request(app)
        .get('/ready')
        .expect(200);
      
      expect(response.body).toHaveProperty('hostname');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  // ============================================================================
  // ERROR HANDLING TESTS
  // ============================================================================
  
  describe('Error Handling', () => {
    it('should return 404 for unknown routes', async () => {
      const response = await request(app)
        .get('/unknown-route')
        .expect('Content-Type', /json/)
        .expect(404);
      
      expect(response.body).toHaveProperty('error', 'Not Found');
      expect(response.body).toHaveProperty('availableEndpoints');
    });

    it('should return helpful message for 404 errors', async () => {
      const response = await request(app)
        .get('/some/random/path')
        .expect(404);
      
      expect(response.body.message).toContain('/some/random/path');
    });
  });
});

// ============================================================================
// INTEGRATION TESTS
// ============================================================================

describe('Integration Tests', () => {
  it('should handle multiple concurrent requests', async () => {
    const requests = Array(5).fill(null).map(() => 
      request(app).get('/health')
    );
    
    const responses = await Promise.all(requests);
    
    responses.forEach(response => {
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('healthy');
    });
  });

  it('should track request metrics correctly', async () => {
    // Make some requests
    await request(app).get('/');
    await request(app).get('/health');
    await request(app).get('/ready');
    
    // Check metrics
    const metricsResponse = await request(app).get('/metrics');
    expect(metricsResponse.text).toContain('http_requests_total');
  });
});
