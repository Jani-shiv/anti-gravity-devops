#!/bin/bash
# ==============================================================================
# Load Testing Script
# ==============================================================================
# This script generates load on the application to trigger HPA scaling.
# It sends concurrent requests to the /load endpoint.
#
# Usage: ./load-test.sh [url] [duration] [concurrency]
# Example: ./load-test.sh http://localhost:3000 60 10
# ==============================================================================

set -e

# Configuration
BASE_URL="${1:-http://localhost:3000}"
DURATION="${2:-60}"      # Total test duration in seconds
CONCURRENCY="${3:-10}"   # Number of concurrent requests
LOAD_DURATION="${4:-5}"  # How long each /load request should stress CPU

echo "=============================================="
echo "📈 LOAD TESTING: HPA Trigger Test"
echo "=============================================="
echo "Target URL: $BASE_URL"
echo "Test Duration: ${DURATION}s"
echo "Concurrency: $CONCURRENCY"
echo "CPU Load Duration: ${LOAD_DURATION}s per request"
echo "=============================================="
echo ""

# Check if required tools are available
if command -v hey &> /dev/null; then
    echo "Using 'hey' for load testing..."
    echo ""
    hey -z "${DURATION}s" -c "$CONCURRENCY" "${BASE_URL}/load?duration=${LOAD_DURATION}"

elif command -v ab &> /dev/null; then
    echo "Using 'ab' (Apache Benchmark) for load testing..."
    echo ""
    REQUESTS=$((DURATION * CONCURRENCY / LOAD_DURATION))
    ab -n "$REQUESTS" -c "$CONCURRENCY" "${BASE_URL}/load?duration=${LOAD_DURATION}"

elif command -v curl &> /dev/null; then
    echo "Using 'curl' for load testing (basic)..."
    echo ""
    
    # Function to send continuous requests
    send_requests() {
        local id=$1
        local end_time=$(($(date +%s) + DURATION))
        
        while [ $(date +%s) -lt $end_time ]; do
            response=$(curl -s -w "%{http_code}" -o /dev/null "${BASE_URL}/load?duration=${LOAD_DURATION}")
            echo "[Worker $id] Response: $response"
        done
    }
    
    # Start concurrent workers
    echo "Starting $CONCURRENCY concurrent workers..."
    for i in $(seq 1 $CONCURRENCY); do
        send_requests $i &
    done
    
    # Wait for all workers
    wait
    echo ""
    echo "Load test completed!"

else
    echo "❌ No load testing tool found!"
    echo ""
    echo "Please install one of:"
    echo "  - hey: go install github.com/rakyll/hey@latest"
    echo "  - ab: Apache Benchmark (comes with Apache)"
    echo "  - Or at minimum, curl"
    exit 1
fi

echo ""
echo "=============================================="
echo "Load test completed!"
echo ""
echo "Check HPA status with:"
echo "  kubectl get hpa -n anti-gravity -w"
echo ""
echo "Check pod scaling with:"
echo "  kubectl get pods -n anti-gravity -w"
echo "=============================================="
