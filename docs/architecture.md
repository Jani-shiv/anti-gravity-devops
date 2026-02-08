# Anti-Gravity DevOps Platform - Architecture

## Overview

This document provides a detailed technical architecture of the Anti-Gravity DevOps Platform, explaining the design decisions, component interactions, and the "anti-gravity" self-healing mechanisms.

## System Components

### 1. Application Layer

**Technology Stack:**

- **Runtime**: Node.js 20 (LTS)
- **Framework**: Express.js 4.x
- **Metrics**: prom-client (Prometheus client library)
- **Testing**: Jest + Supertest

**Endpoints:**

| Endpoint   | Purpose                              | Used By         |
| ---------- | ------------------------------------ | --------------- |
| `/health`  | Kubernetes liveness/readiness probes | kubelet         |
| `/ready`   | Granular readiness check             | kubelet         |
| `/load`    | CPU stress for HPA testing           | Load generators |
| `/metrics` | Prometheus metrics exposure          | Prometheus      |

### 2. Container Layer

**Dockerfile Best Practices:**

```dockerfile
# Multi-stage build reduces final image size
FROM node:20-alpine AS builder  # Stage 1: Build
FROM node:20-alpine AS production  # Stage 2: Runtime

# Non-root user for security
RUN adduser -S antigravity -u 1001
USER antigravity

# Health check for Docker-level monitoring
HEALTHCHECK --interval=30s CMD node healthcheck.js
```

**Image Size Optimization:**

- Base image: `node:20-alpine` (~50MB vs ~1GB for full node image)
- Multi-stage: Only production dependencies in final image
- `.dockerignore`: Excludes tests, docs, and development files

### 3. Kubernetes Layer

#### Deployment Strategy

```yaml
strategy:
  type: RollingUpdate
  rollingUpdate:
    maxUnavailable: 1 # Maximum 1 pod unavailable during update
    maxSurge: 1 # Maximum 1 extra pod during update
```

This ensures zero-downtime deployments.

#### Probe Configuration

```
┌─────────────────────────────────────────────────────────────┐
│                    POD LIFECYCLE                             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Container Start                                             │
│       │                                                      │
│       ▼                                                      │
│  ┌─────────────┐                                             │
│  │ STARTUP     │ ← Runs until success (max 150s)            │
│  │ PROBE       │   Prevents premature liveness checks       │
│  └─────────────┘                                             │
│       │ Success                                              │
│       ▼                                                      │
│  ┌─────────────┐         ┌─────────────┐                    │
│  │ LIVENESS    │         │ READINESS   │                    │
│  │ PROBE       │         │ PROBE       │                    │
│  └─────────────┘         └─────────────┘                    │
│       │                        │                             │
│       │ Failure (3x)           │ Failure (3x)               │
│       ▼                        ▼                             │
│  ┌─────────────┐         ┌────────────────┐                 │
│  │ RESTART     │         │ REMOVE FROM    │                 │
│  │ CONTAINER   │         │ SERVICE        │                 │
│  └─────────────┘         └────────────────┘                 │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 4. Auto-Scaling (HPA)

The Horizontal Pod Autoscaler is the core "anti-gravity" mechanism.

**Scaling Algorithm:**

```
desiredReplicas = ceil[currentReplicas * (currentMetricValue / targetMetricValue)]
```

**Example:**

- Current replicas: 2
- Current CPU: 80%
- Target CPU: 50%
- Desired: ceil(2 \* 80/50) = ceil(3.2) = 4 replicas

**Scaling Behavior:**

```
┌────────────────────────────────────────────────────────┐
│                 HPA DECISION FLOW                       │
├────────────────────────────────────────────────────────┤
│                                                         │
│  Metrics Server ──▶ HPA Controller ──▶ Deployment      │
│                          │                              │
│                    ┌─────┴─────┐                       │
│                    ▼           ▼                       │
│              [Scale Up?]  [Scale Down?]                │
│                    │           │                       │
│              ┌─────┘           └─────┐                 │
│              ▼                       ▼                 │
│     stabilizationWindow:30s  stabilizationWindow:300s  │
│              │                       │                 │
│              ▼                       ▼                 │
│     Max(+100%, +4 pods)       Min(-50%, -1 pod)       │
│                                                         │
└────────────────────────────────────────────────────────┘
```

### 5. Monitoring Stack

**Data Flow:**

```
Application ──▶ /metrics ──▶ Prometheus ──▶ PromQL ──▶ Grafana
                  │              │
                  ▼              ▼
            prom-client    Time-series DB
              Format         (15d retention)
```

**Key Metrics:**

| Metric                          | Type      | Labels               | Description          |
| ------------------------------- | --------- | -------------------- | -------------------- |
| `http_requests_total`           | Counter   | method, path, status | Total HTTP requests  |
| `http_request_duration_seconds` | Histogram | method, path         | Request latency      |
| `load_tests_total`              | Counter   | -                    | Number of load tests |
| `nodejs_heap_size_used_bytes`   | Gauge     | -                    | Memory usage         |

### 6. Networking

```
┌──────────────────────────────────────────────────────────┐
│                   EXTERNAL ACCESS                         │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  Internet ──▶ NGINX Ingress Controller                   │
│                      │                                    │
│              ┌───────┴───────┐                           │
│              ▼               ▼                           │
│      anti-gravity.local  grafana.local                   │
│              │               │                           │
│              ▼               ▼                           │
│    ┌─────────────────┐   ┌─────────────┐                │
│    │ Service:        │   │ Service:    │                │
│    │ anti-gravity    │   │ grafana     │                │
│    │ (ClusterIP)     │   │ (ClusterIP) │                │
│    └────────┬────────┘   └──────┬──────┘                │
│             │                   │                        │
│     ┌───────┼───────┐          │                        │
│     ▼       ▼       ▼          ▼                        │
│   Pod 1   Pod 2   Pod N    Grafana Pod                  │
│                                                           │
└──────────────────────────────────────────────────────────┘
```

## Self-Healing Mechanisms

### 1. Container Health Checks

**When a container becomes unhealthy:**

1. Liveness probe fails 3 consecutive times
2. kubelet kills the container
3. Container runtime restarts it
4. Startup probe runs
5. Once healthy, liveness/readiness probes resume

### 2. Pod Auto-Restart

**When a pod crashes:**

1. Container exits with error
2. Deployment controller detects missing replica
3. New pod is scheduled on available node
4. Container starts with fresh state

### 3. Traffic Failover

**When a pod becomes unready:**

1. Readiness probe fails
2. Pod IP removed from Service endpoints
3. Traffic routed to remaining healthy pods
4. When pod recovers, added back to endpoints

### 4. Auto-Scaling

**When load increases:**

1. CPU metrics exceed 50% average
2. HPA calculates required replicas
3. New pods scheduled and started
4. Traffic distributed across more pods
5. CPU per pod decreases

## Security Considerations

### Container Security

- **Non-root user**: Container runs as UID 1001
- **Read-only filesystem**: Where possible
- **No privilege escalation**: `allowPrivilegeEscalation: false`
- **Minimal base image**: Alpine Linux

### Network Security

- **Network Policies**: Can be added to restrict pod communication
- **Ingress TLS**: Ready for cert-manager integration
- **Rate Limiting**: NGINX annotations configured

### Secret Management

- **ConfigMaps**: For non-sensitive configuration
- **Secrets**: For sensitive data (encoded, not in Git)
- **RBAC**: Prometheus uses minimal service account

## Performance Considerations

### Resource Allocation

| Component  | CPU Request | CPU Limit | Memory Request | Memory Limit |
| ---------- | ----------- | --------- | -------------- | ------------ |
| App        | 100m        | 500m      | 128Mi          | 256Mi        |
| Prometheus | 100m        | 500m      | 256Mi          | 512Mi        |
| Grafana    | 50m         | 200m      | 128Mi          | 256Mi        |

### Scaling Limits

- **Min replicas**: 2 (for high availability)
- **Max replicas**: 10 (prevent runaway scaling)
- **Scale-up delay**: 30 seconds
- **Scale-down delay**: 5 minutes

## Disaster Recovery

### Backup Strategy

1. **Application State**: Stateless design - no backup needed
2. **Configuration**: All in Git (Infrastructure as Code)
3. **Metrics Data**: Prometheus retention: 7 days

### Recovery Procedure

1. Restore Kubernetes cluster
2. Apply all manifests from Git
3. Verify HPA and probes working
4. Import Grafana dashboard

---

_This architecture is designed for educational purposes and demonstrates production-grade patterns for portfolio assessment._
