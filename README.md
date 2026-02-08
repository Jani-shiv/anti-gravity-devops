# 🚀 Anti-Gravity DevOps Platform

<div align="center">

![Anti-Gravity DevOps Platform](https://img.shields.io/badge/DevOps-Platform-blueviolet?style=for-the-badge&logo=kubernetes)
![Kubernetes](https://img.shields.io/badge/kubernetes-%23326ce5.svg?style=for-the-badge&logo=kubernetes&logoColor=white)
![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)
![Prometheus](https://img.shields.io/badge/Prometheus-E6522C?style=for-the-badge&logo=Prometheus&logoColor=white)
![Grafana](https://img.shields.io/badge/grafana-%23F46800.svg?style=for-the-badge&logo=grafana&logoColor=white)

**A self-healing, auto-scaling, fault-tolerant infrastructure demonstration**

_Just as anti-gravity resists the pull of falling, this platform resists the pull of system failure._

</div>

---

## 📖 The "Anti-Gravity" Analogy

In the real world, **gravity** constantly pulls objects downward. Without resistance, everything falls.

In the world of DevOps:

- **"Gravity"** = System load, failures, crashes, and traffic spikes that pull your infrastructure down
- **"Anti-Gravity"** = Self-healing mechanisms that automatically push back against failures

This project demonstrates how modern DevOps practices create **"anti-gravity"** for your applications:

| Gravity (Problem)   | Anti-Gravity (Solution)                    |
| ------------------- | ------------------------------------------ |
| Pod crashes         | Kubernetes auto-restarts (Liveness Probes) |
| Traffic spikes      | HPA auto-scales pods                       |
| Deployment failures | Rolling updates with rollback              |
| Resource exhaustion | Resource limits & requests                 |
| Silent failures     | Prometheus monitoring & alerts             |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           CI/CD PIPELINE                                     │
│  ┌─────────┐    ┌─────────┐    ┌──────────┐    ┌────────────────┐          │
│  │ GitHub  │───▶│  Test   │───▶│  Build   │───▶│ Push to GHCR   │          │
│  │  Push   │    │ (Jest)  │    │ (Docker) │    │                │          │
│  └─────────┘    └─────────┘    └──────────┘    └───────┬────────┘          │
│                                                         │                   │
└─────────────────────────────────────────────────────────┼───────────────────┘
                                                          │
                                                          ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        KUBERNETES CLUSTER                                    │
│                                                                              │
│   ┌──────────────────────────────────────────────────────────────────┐      │
│   │                     INGRESS (NGINX)                               │      │
│   │                    anti-gravity.local                             │      │
│   └──────────────────────────────┬───────────────────────────────────┘      │
│                                  │                                          │
│   ┌──────────────────────────────▼───────────────────────────────────┐      │
│   │                        SERVICE                                    │      │
│   │                   anti-gravity:80                                 │      │
│   └─────┬──────────────────┬──────────────────┬────────────────┬────┘      │
│         │                  │                  │                │            │
│   ┌─────▼─────┐    ┌───────▼───────┐   ┌──────▼──────┐  ┌──────▼──────┐    │
│   │   Pod 1   │    │    Pod 2      │   │   Pod 3     │  │   Pod N     │    │
│   │ ┌───────┐ │    │ ┌───────────┐ │   │ ┌─────────┐ │  │ ┌─────────┐ │    │
│   │ │App:   │ │    │ │   App:    │ │   │ │  App:   │ │  │ │  App:   │ │    │
│   │ │ /health│ │◀──┤ │  /health  │ │◀──┤ │ /health │ │◀─┤ │ /health │ │    │
│   │ │ /load │ │    │ │  /load    │ │   │ │  /load  │ │  │ │  /load  │ │    │
│   │ │/metrics│ │   │ │ /metrics  │ │   │ │/metrics │ │  │ │/metrics │ │    │
│   │ └───────┘ │    │ └───────────┘ │   │ └─────────┘ │  │ └─────────┘ │    │
│   └───────────┘    └───────────────┘   └─────────────┘  └─────────────┘    │
│         ▲                  ▲                  ▲                ▲            │
│         │                  │                  │                │            │
│         └──────────────────┴──────────────────┴────────────────┘            │
│                                    │                                         │
│                        ┌───────────▼───────────┐                            │
│                        │   HPA (Auto-Scaler)   │                            │
│                        │  CPU Target: 50%      │                            │
│                        │  Min: 2, Max: 10      │                            │
│                        └───────────────────────┘                            │
│                                                                              │
│   ┌────────────────────────────────────────────────────────────────┐        │
│   │                    MONITORING STACK                            │        │
│   │  ┌────────────────┐              ┌──────────────────┐         │        │
│   │  │   Prometheus   │─────────────▶│     Grafana      │         │        │
│   │  │   (Metrics)    │              │   (Dashboards)   │         │        │
│   │  └────────────────┘              └──────────────────┘         │        │
│   └────────────────────────────────────────────────────────────────┘        │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
anti-gravity-devops/
├── 📁 .github/workflows/     # CI/CD Pipeline
│   └── ci-cd.yml             # GitHub Actions workflow
├── 📁 docker/                # Container configuration
│   └── Dockerfile            # Multi-stage production build
├── 📁 docs/                  # Documentation
│   └── architecture.md       # Detailed architecture
├── 📁 k8s/                   # Kubernetes manifests
│   ├── namespace.yaml        # Namespace isolation
│   ├── configmap.yaml        # Application config
│   ├── deployment.yaml       # Pod deployment + probes
│   ├── service.yaml          # Internal networking
│   ├── ingress.yaml          # External access
│   └── hpa.yaml              # Auto-scaling config
├── 📁 monitoring/            # Observability
│   ├── prometheus-config.yaml
│   ├── prometheus-deployment.yaml
│   ├── grafana-deployment.yaml
│   └── grafana-dashboard.json
├── 📁 scripts/               # Chaos engineering
│   ├── chaos-pod-kill.sh     # Kill random pods
│   ├── load-test.sh          # Generate load
│   └── observe-recovery.sh   # Monitor recovery
├── 📁 src/                   # Application source
│   └── app.js                # Express.js server
├── 📁 tests/                 # Test suite
│   └── app.test.js           # Jest unit tests
├── .dockerignore
├── .gitignore
├── package.json
└── README.md
```

---

## 🛠️ Prerequisites

Before you begin, ensure you have:

| Tool       | Version | Purpose                    |
| ---------- | ------- | -------------------------- |
| Node.js    | ≥18.0.0 | Application runtime        |
| Docker     | ≥20.0.0 | Container builds           |
| kubectl    | ≥1.28.0 | Kubernetes CLI             |
| Kubernetes | ≥1.28.0 | Container orchestration    |
| Helm       | ≥3.0.0  | Package manager (optional) |

### Kubernetes Options

Choose one:

- **Local**: [Minikube](https://minikube.sigs.k8s.io/), [Docker Desktop](https://www.docker.com/products/docker-desktop/), [Kind](https://kind.sigs.k8s.io/)
- **Cloud**: GKE, EKS, AKS, DigitalOcean

---

## 🚀 Quick Start

### 1️⃣ Clone and Setup

```bash
git clone https://github.com/YOUR_USERNAME/anti-gravity-devops.git
cd anti-gravity-devops
npm install
```

### 2️⃣ Run Locally

```bash
npm start
# Server starts at http://localhost:3000
```

Test endpoints:

```bash
curl http://localhost:3000/health
curl http://localhost:3000/load?duration=5
curl http://localhost:3000/metrics
```

### 3️⃣ Run Tests

```bash
npm test
```

### 4️⃣ Build Docker Image

```bash
docker build -f docker/Dockerfile -t anti-gravity:latest .
docker run -p 3000:3000 anti-gravity:latest
```

---

## ☸️ Kubernetes Deployment

### Step 1: Start Your Cluster

**Minikube:**

```bash
minikube start --memory=4096 --cpus=2
minikube addons enable ingress
minikube addons enable metrics-server
```

**Docker Desktop:**
Enable Kubernetes in Docker Desktop settings.

### Step 2: Deploy the Application

```bash
# Create namespace and deploy all resources
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/ingress.yaml
kubectl apply -f k8s/hpa.yaml

# Verify deployment
kubectl get all -n anti-gravity
```

### Step 3: Deploy Monitoring Stack

```bash
kubectl apply -f monitoring/prometheus-config.yaml
kubectl apply -f monitoring/prometheus-deployment.yaml
kubectl apply -f monitoring/grafana-deployment.yaml
```

### Step 4: Access the Application

**Using Minikube:**

```bash
# Get Minikube IP
minikube ip

# Add to /etc/hosts (Linux/Mac) or C:\Windows\System32\drivers\etc\hosts (Windows)
<minikube-ip> anti-gravity.local grafana.local
```

**Using Port Forward (any cluster):**

```bash
# Application
kubectl port-forward svc/anti-gravity 3000:80 -n anti-gravity

# Prometheus
kubectl port-forward svc/prometheus 9090:9090 -n anti-gravity

# Grafana
kubectl port-forward svc/grafana 3001:3001 -n anti-gravity
```

---

## 🧪 Chaos Engineering Tests

### Test 1: Pod Failure Recovery

```bash
# Watch pods in one terminal
kubectl get pods -n anti-gravity -w

# Kill a pod in another terminal
kubectl delete pod -n anti-gravity -l app=anti-gravity --force

# Observe: Kubernetes immediately creates a new pod!
```

### Test 2: Auto-Scaling Under Load

```bash
# Watch HPA in one terminal
kubectl get hpa -n anti-gravity -w

# Generate load in another terminal
# Using the provided script:
./scripts/load-test.sh http://anti-gravity.local 60 10

# Or manually:
for i in {1..50}; do curl "http://localhost:3000/load?duration=10" & done

# Observe: HPA scales pods up to handle load!
```

### Test 3: Observe Recovery

```bash
./scripts/observe-recovery.sh
```

---

## 📊 Monitoring with Grafana

1. Access Grafana at `http://localhost:3001`
2. Login: `admin` / `antigravity`
3. Import dashboard from `monitoring/grafana-dashboard.json`

### Dashboard Panels

| Panel         | Description                                  |
| ------------- | -------------------------------------------- |
| Running Pods  | Current replica count                        |
| CPU Usage     | Average CPU across pods                      |
| Memory Usage  | Heap memory consumption                      |
| Pod Restarts  | Total restart count (self-healing indicator) |
| Request Rate  | HTTP requests per second                     |
| Latency (p95) | 95th percentile response time                |
| HPA Replicas  | Current vs desired replicas                  |
| Load Tests    | Load test requests over time                 |

---

## 🔄 CI/CD Pipeline

The GitHub Actions pipeline runs automatically on push to `main`:

```yaml
Stages: 1. Test     → Run Jest unit tests
  2. Build    → Build Docker image (multi-stage)
  3. Push     → Push to GitHub Container Registry
  4. Deploy   → Deploy to Kubernetes
  5. Security → Scan image with Trivy
```

### Setup CI/CD

1. **Enable GitHub Actions** in your repository
2. **Add Secret**: Go to Settings → Secrets → New Secret
   - Name: `KUBE_CONFIG`
   - Value: `base64 -w0 ~/.kube/config`

---

## 🎯 API Reference

| Endpoint           | Method | Description                            |
| ------------------ | ------ | -------------------------------------- |
| `/`                | GET    | Welcome message with system info       |
| `/health`          | GET    | Health check for K8s probes            |
| `/ready`           | GET    | Readiness check                        |
| `/load?duration=N` | GET    | CPU stress test for N seconds (max 30) |
| `/metrics`         | GET    | Prometheus metrics endpoint            |

---

## 🔧 Configuration

### Environment Variables

| Variable   | Default    | Description    |
| ---------- | ---------- | -------------- |
| `PORT`     | 3000       | Server port    |
| `NODE_ENV` | production | Environment    |
| `HOSTNAME` | auto       | Pod identifier |

### HPA Configuration

| Parameter         | Value | Description          |
| ----------------- | ----- | -------------------- |
| Min Replicas      | 2     | Minimum pods for HA  |
| Max Replicas      | 10    | Maximum scale limit  |
| CPU Target        | 50%   | Scale-up threshold   |
| Scale-up Window   | 30s   | Stabilization period |
| Scale-down Window | 300s  | Cool-down period     |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing`
5. Open a Pull Request

---

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

<div align="center">

**Built with ❤️ for DevOps Engineers**

_Defying gravity, one pod at a time_ 🚀

</div>
