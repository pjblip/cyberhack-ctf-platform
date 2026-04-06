#!/bin/bash

# ========================================
# CTF Platform - Database Backup Script
# ========================================
# This script backs up the database every hour during the event

echo "========================================"
echo "CTF Database Backup Script"
echo "========================================"
echo ""
echo "This will backup the database every hour"
echo "Press Ctrl+C to stop"
echo ""

# Create backup directory if it doesn't exist
mkdir -p backend/backups

while true; do
    # Get current timestamp
    TIMESTAMP=$(date +"%Y%m%d-%H%M%S")
    
    # Backup the database
    echo "[$(date)] Creating backup..."
    cp backend/cyberhack.db backend/backups/cyberhack-$TIMESTAMP.db
    
    if [ $? -eq 0 ]; then
        echo "[$(date)] Backup successful: cyberhack-$TIMESTAMP.db"
    else
        echo "[$(date)] Backup FAILED!"
    fi
    
    echo ""
    echo "Next backup in 1 hour..."
    echo "Press Ctrl+C to stop"
    echo ""
    
    # Wait 1 hour (3600 seconds)
    sleep 3600
done
