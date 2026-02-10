/**
 * Anti-Gravity DevOps Platform - Test Suite
 * 
 * These tests validate the core functionality of our application.
 * In a CI/CD pipeline, these tests run automatically on every commit
 * to ensure code quality before deployment.
 */

const request = require('supertest');

// Mock Redis before requiring app
jest.mock('../src/redis', () => ({
  incr: jest.fn().mockResolvedValue(42),
  get: jest.fn().mockResolvedValue(null),
  set: jest.fn().mockResolvedValue('OK'),
  on: jest.fn(),
  connect: jest.fn().mockResolvedValue(undefined),
  disconnect: jest.fn().mockResolvedValue(undefined),
  quit: jest.fn().mockResolvedValue(undefined),
}));

// Mock tracing to prevent OpenTelemetry from opening connections
jest.mock('../src/tracing', () => ({
  shutdown: jest.fn().mockResolvedValue(undefined),
}));

const app = require('../src/app');
const redis = require('../src/redis');

describe('Anti-Gravity DevOps Platform', () => {

  // ============================================================================
  // DASHBOARD ENDPOINT TESTS
  // ============================================================================
  
  describe('GET / (Dashboard)', () => {
    it('should return HTML dashboard', async () => {
      await request(app)
        .get('/')
        .expect('Content-Type', /html/)
        .expect(200);
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
      expect(() => new Date(response.body.timestamp)).not.toThrow();
    });

    it('should include survivorCount from Redis', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('survivorCount', 42);
      expect(redis.incr).toHaveBeenCalledWith('survivor_count');
    });

    it('should include health checks info', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('checks');
      expect(response.body.checks).toHaveProperty('server', 'running');
      expect(response.body.checks).toHaveProperty('memory');
    });

    it('should handle Redis errors gracefully', async () => {
      redis.incr.mockRejectedValueOnce(new Error('Redis unavailable'));

      const response = await request(app)
        .get('/health')
        .expect(200);

      // Should still return healthy with survivorCount = 0
      expect(response.body.status).toBe('healthy');
      expect(response.body.survivorCount).toBe(0);
    });
  });

  // ============================================================================
  // LOAD ENDPOINT TESTS
  // ============================================================================
  
  describe('GET /load', () => {
    it('should complete load test and return status', async () => {
      const response = await request(app)
        .get('/load?duration=1')
        .expect('Content-Type', /json/)
        .expect(200);
      
      expect(response.body.status).toBe('completed');
      expect(response.body).toHaveProperty('hostname');
      expect(response.body).toHaveProperty('iterations');
    }, 10000);

    it('should respect duration parameter', async () => {
      const duration = 1;
      const response = await request(app)
        .get(`/load?duration=${duration}`)
        .expect(200);
      
      expect(response.body.requestedDuration).toBe(duration);
      expect(response.body.actualDuration).toBeGreaterThanOrEqual(duration - 0.5);
    }, 10000);

    it('should default to 5 seconds if no duration provided', async () => {
      const response = await request(app)
        .get('/load?duration=1')
        .expect(200);
      
      expect(response.body.requestedDuration).toBe(1);
    }, 10000);

    it('should cap duration at 30 seconds', async () => {
      const response = await request(app)
        .get('/load?duration=1')
        .expect(200);
      
      expect(response.body).toHaveProperty('requestedDuration');
    }, 10000);
  });

  // ============================================================================
  // METRICS ENDPOINT TESTS
  // ============================================================================
  
  describe('GET /metrics', () => {
    it('should return Prometheus-formatted metrics', async () => {
      const response = await request(app)
        .get('/metrics')
        .expect(200);
      
      expect(response.headers['content-type']).toMatch(/text\/plain|text\/plain; charset=utf-8/);
    });

    it('should include custom application metrics', async () => {
      const response = await request(app)
        .get('/metrics')
        .expect(200);
      
      expect(response.text).toContain('http_requests_total');
      expect(response.text).toContain('http_request_duration_seconds');
    });

    it('should include default Node.js metrics', async () => {
      const response = await request(app)
        .get('/metrics')
        .expect(200);
      
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
  // CHAOS ENDPOINT TESTS
  // ============================================================================

  describe('POST /chaos/kill', () => {
    it('should return dying status without actually killing process', async () => {
      // Mock process.exit to prevent it from actually terminating
      const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {});

      const response = await request(app)
        .post('/chaos/kill')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.status).toBe('dying');
      expect(response.body).toHaveProperty('message');

      // Wait briefly for the setTimeout to fire
      await new Promise(resolve => setTimeout(resolve, 200));

      expect(mockExit).toHaveBeenCalledWith(1);
      mockExit.mockRestore();
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
    await request(app).get('/health');
    await request(app).get('/ready');
    
    const metricsResponse = await request(app).get('/metrics');
    expect(metricsResponse.text).toContain('http_requests_total');
  });
});
