#!/bin/bash
# ==============================================================================
# Observe Recovery Script
# ==============================================================================
# This script monitors the cluster during chaos experiments and load tests.
# It shows real-time pod status, HPA decisions, and resource usage.
#
# Usage: ./observe-recovery.sh [namespace]
# ==============================================================================

NAMESPACE="${1:-anti-gravity}"

echo "=============================================="
echo "👁️ OBSERVING ANTI-GRAVITY RECOVERY"
echo "=============================================="
echo "Namespace: $NAMESPACE"
echo "Press Ctrl+C to stop"
echo "=============================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print a section
print_section() {
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${YELLOW}$1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

while true; do
    clear
    
    echo "=============================================="
    echo "🚀 ANTI-GRAVITY DEVOPS PLATFORM - LIVE MONITOR"
    echo "=============================================="
    echo "Time: $(date '+%Y-%m-%d %H:%M:%S')"
    echo ""
    
    # Pod Status
    print_section "📦 POD STATUS"
    kubectl get pods -n "$NAMESPACE" -o wide 2>/dev/null || echo "Unable to get pods"
    echo ""
    
    # HPA Status
    print_section "📈 HORIZONTAL POD AUTOSCALER"
    kubectl get hpa -n "$NAMESPACE" 2>/dev/null || echo "No HPA found"
    echo ""
    
    # Recent Pod Events
    print_section "📋 RECENT EVENTS (Last 5)"
    kubectl get events -n "$NAMESPACE" --sort-by='.lastTimestamp' 2>/dev/null | tail -6 || echo "No events"
    echo ""
    
    # Resource Usage (if metrics-server is available)
    print_section "💻 RESOURCE USAGE"
    kubectl top pods -n "$NAMESPACE" 2>/dev/null || echo "Metrics server not available"
    echo ""
    
    # Deployment Status
    print_section "🔄 DEPLOYMENT STATUS"
    kubectl rollout status deployment/anti-gravity -n "$NAMESPACE" --timeout=1s 2>/dev/null || echo "Checking..."
    echo ""
    
    # Summary
    RUNNING=$(kubectl get pods -n "$NAMESPACE" --field-selector=status.phase=Running --no-headers 2>/dev/null | wc -l)
    PENDING=$(kubectl get pods -n "$NAMESPACE" --field-selector=status.phase=Pending --no-headers 2>/dev/null | wc -l)
    RESTARTS=$(kubectl get pods -n "$NAMESPACE" -o jsonpath='{range .items[*]}{.status.containerStatuses[0].restartCount}{"\n"}{end}' 2>/dev/null | awk '{sum+=$1} END {print sum}')
    
    print_section "📊 SUMMARY"
    echo -e "  Running Pods:  ${GREEN}$RUNNING${NC}"
    echo -e "  Pending Pods:  ${YELLOW}$PENDING${NC}"
    echo -e "  Total Restarts: ${RED}${RESTARTS:-0}${NC}"
    echo ""
    
    echo "Refreshing in 5 seconds..."
    sleep 5
done
