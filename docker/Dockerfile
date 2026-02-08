# ==============================================================================
# Anti-Gravity DevOps Platform - Production Dockerfile
# ==============================================================================
#
# This Dockerfile follows production best practices:
# 1. Multi-stage build for smaller final image
# 2. Non-root user for security
# 3. Minimal base image (Alpine)
# 4. Proper layer caching
# 5. Health check instruction
#
# Build: docker build -f docker/Dockerfile -t anti-gravity:latest .
# Run:   docker run -p 3000:3000 anti-gravity:latest
# ==============================================================================

# -----------------------------------------------------------------------------
# Stage 1: Builder
# Purpose: Install dependencies including devDependencies for full npm install
# -----------------------------------------------------------------------------
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files first (for better layer caching)
# This layer is cached unless package*.json changes
COPY package*.json ./

# Install ALL dependencies (including devDependencies for potential build steps)
RUN npm ci

# Copy source code
COPY . .

# Prune devDependencies for production
RUN npm prune --production

# -----------------------------------------------------------------------------
# Stage 2: Production
# Purpose: Minimal runtime image with only production assets
# -----------------------------------------------------------------------------
FROM node:20-alpine AS production

# Add labels for better image management
LABEL maintainer="DevOps Engineer"
LABEL version="1.0.0"
LABEL description="Anti-Gravity DevOps Platform - Self-healing, auto-scaling infrastructure"

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Create non-root user for security
# WHY: Running containers as root is a security risk. If an attacker
# compromises the application, they would have root access to the container.
RUN addgroup -g 1001 -S nodejs && \
    adduser -S antigravity -u 1001 -G nodejs

# Set working directory
WORKDIR /app

# Copy only production files from builder
COPY --from=builder --chown=antigravity:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=antigravity:nodejs /app/src ./src
COPY --from=builder --chown=antigravity:nodejs /app/package*.json ./

# Switch to non-root user
USER antigravity

# Expose application port
EXPOSE 3000

# Health check instruction
# Kubernetes has its own probes, but this is useful for Docker-only deployments
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/health', (r) => r.statusCode === 200 ? process.exit(0) : process.exit(1))"

# Start the application
CMD ["node", "src/app.js"]
