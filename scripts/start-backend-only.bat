@echo off
title Backend API - Mystic Flag Forge 2.0
color 0B

echo ========================================
echo   BACKEND API SERVER
echo   Mystic Flag Forge 2.0
echo ========================================
echo.

REM Get script directory and navigate to backend folder
set SCRIPT_DIR=%~dp0
cd /d "%SCRIPT_DIR%backend"

echo Current directory: %CD%
echo.

echo Checking for node_modules...
if not exist "node_modules" (
    echo [WARN] node_modules not found. Running npm install...
    npm install
    echo.
)

echo Starting Backend API Server...
echo This will run on port 3001
echo.
echo Press Ctrl+C to stop the server
echo.
echo ========================================
echo.

npm run start:dev
