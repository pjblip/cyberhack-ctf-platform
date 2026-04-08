#!/bin/bash

# ========================================
# CTF Platform - Hosts File Setup
# ========================================
# This adds ctf.local to Linux/Mac hosts file

echo "========================================"
echo "CTF Platform - Hosts File Setup"
echo "========================================"
echo ""
echo "This will add ctf.local to your hosts file"
echo "You need to run this with sudo!"
echo ""
echo "After setup, you can access the CTF at:"
echo "http://ctf.local:3002"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo "ERROR: This script requires root privileges!"
    echo ""
    echo "Please run with sudo:"
    echo "sudo bash setup-ctf-hosts.sh"
    echo ""
    exit 1
fi

echo "Adding ctf.local to hosts file..."
echo ""

# Check if entry already exists
if grep -q "ctf.local" /etc/hosts; then
    echo "Entry already exists in hosts file!"
    echo "Skipping..."
else
    # Add entry to hosts file
    echo "192.168.0.106  ctf.local" >> /etc/hosts
    
    if [ $? -eq 0 ]; then
        echo "========================================"
        echo "Setup Complete!"
        echo "========================================"
        echo ""
        echo "You can now access the CTF platform at:"
        echo "http://ctf.local:3002"
        echo ""
        
        # Try to open browser (if available)
        if command -v xdg-open &> /dev/null; then
            echo "Opening browser..."
            xdg-open http://ctf.local:3002 2>/dev/null &
        elif command -v open &> /dev/null; then
            echo "Opening browser..."
            open http://ctf.local:3002 2>/dev/null &
        fi
    else
        echo ""
        echo "ERROR: Failed to update hosts file!"
        echo "Please check permissions and try again."
        exit 1
    fi
fi

echo ""
