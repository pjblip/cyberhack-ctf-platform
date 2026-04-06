#!/bin/bash

echo "========================================"
echo " Updating Ransomware Reversal Challenge"
echo "========================================"
echo ""

cd backend
node update-ransomware-challenge.js

echo ""
echo "========================================"
echo " Update Complete!"
echo "========================================"
echo ""
echo "Next steps:"
echo "1. Restart the backend server if it's running"
echo "2. Refresh the website to see the changes"
echo ""
