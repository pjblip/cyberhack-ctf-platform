#!/bin/bash

# ========================================
# CTF Platform - Server Monitor Script
# ========================================
# This script checks if the servers are running

while true; do
    clear
    echo "========================================"
    echo "CTF Server Monitor"
    echo "========================================"
    echo ""
    echo "Checking servers at $(date)"
    echo ""
    
    # Check Backend (Port 3001)
    echo "[Backend] Checking http://localhost:3001/api/challenges"
    BACKEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/api/challenges)
    
    if [ "$BACKEND_STATUS" = "200" ]; then
        echo "Backend: RUNNING ✓ (Status: $BACKEND_STATUS)"
    else
        echo "Backend: DOWN ✗ (Status: $BACKEND_STATUS)"
        echo "WARNING: Backend is not responding!"
    fi
    
    echo ""
    
    # Check Frontend (Port 3002)
    echo "[Frontend] Checking http://localhost:3002"
    FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3002)
    
    if [ "$FRONTEND_STATUS" = "200" ]; then
        echo "Frontend: RUNNING ✓ (Status: $FRONTEND_STATUS)"
    else
        echo "Frontend: DOWN ✗ (Status: $FRONTEND_STATUS)"
        echo "WARNING: Frontend is not responding!"
    fi
    
    echo ""
    echo "========================================"
    echo "Next check in 30 seconds..."
    echo "Press Ctrl+C to stop monitoring"
    echo "========================================"
    echo ""
    
    # Wait 30 seconds
    sleep 30
done
