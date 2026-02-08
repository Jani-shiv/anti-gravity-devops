#!/bin/bash
# ==============================================================================
# Chaos Engineering: Pod Kill Script
# ==============================================================================
# This script randomly kills pods to test the self-healing capability.
# The "anti-gravity" (Kubernetes Deployment) should automatically recreate them.
#
# Usage: ./chaos-pod-kill.sh [namespace] [pod-label]
# Example: ./chaos-pod-kill.sh anti-gravity app=anti-gravity
# ==============================================================================

set -e

# Configuration
NAMESPACE="${1:-anti-gravity}"
LABEL="${2:-app=anti-gravity}"
INTERVAL="${3:-10}"  # Seconds between kills

echo "=============================================="
echo "🔥 CHAOS ENGINEERING: Pod Kill Test"
echo "=============================================="
echo "Namespace: $NAMESPACE"
echo "Pod Label: $LABEL"
echo "Kill Interval: ${INTERVAL}s"
echo "=============================================="
echo ""
echo "This will randomly kill pods to test self-healing."
echo "Watch the pods recover automatically!"
echo ""
echo "Press Ctrl+C to stop."
echo ""

# Function to get random pod
get_random_pod() {
    kubectl get pods -n "$NAMESPACE" -l "$LABEL" -o jsonpath='{.items[*].metadata.name}' | tr ' ' '\n' | shuf -n 1
}

# Function to kill a pod
kill_pod() {
    local POD_NAME=$1
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] 💀 Killing pod: $POD_NAME"
    kubectl delete pod "$POD_NAME" -n "$NAMESPACE" --grace-period=0 --force 2>/dev/null || true
}

# Main loop
iteration=1
while true; do
    echo ""
    echo "--- Chaos Iteration $iteration ---"
    
    # Get current pod count
    POD_COUNT=$(kubectl get pods -n "$NAMESPACE" -l "$LABEL" --no-headers | wc -l)
    echo "📊 Current running pods: $POD_COUNT"
    
    # Get a random pod
    POD_TO_KILL=$(get_random_pod)
    
    if [ -n "$POD_TO_KILL" ]; then
        kill_pod "$POD_TO_KILL"
        
        # Wait a moment and show recovery
        sleep 3
        
        echo ""
        echo "📊 Pod status after kill:"
        kubectl get pods -n "$NAMESPACE" -l "$LABEL" -o wide
        
        echo ""
        echo "🔄 Waiting for recovery..."
        kubectl rollout status deployment/anti-gravity -n "$NAMESPACE" --timeout=60s 2>/dev/null || true
        
        NEW_POD_COUNT=$(kubectl get pods -n "$NAMESPACE" -l "$LABEL" --field-selector=status.phase=Running --no-headers | wc -l)
        echo "✅ Pods recovered: $NEW_POD_COUNT running"
    else
        echo "⚠️ No pods found to kill"
    fi
    
    echo ""
    echo "Waiting ${INTERVAL}s before next chaos..."
    sleep "$INTERVAL"
    ((iteration++))
done
