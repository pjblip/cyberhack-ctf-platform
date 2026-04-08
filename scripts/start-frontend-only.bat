@echo off
title Frontend - Mystic Flag Forge 2.0
color 0A

echo ========================================
echo   FRONTEND SERVER
echo   Mystic Flag Forge 2.0
echo ========================================
echo.

REM Get script directory
set SCRIPT_DIR=%~dp0
cd /d "%SCRIPT_DIR%"

echo Current directory: %CD%
echo.

echo Checking for node_modules...
if not exist "node_modules" (
    echo [WARN] node_modules not found. Running npm install...
    npm install
    echo.
)

echo Starting Frontend Server...
echo This will run on port 3002
echo.
echo Press Ctrl+C to stop the server
echo.
echo ========================================
echo.

npm run dev
