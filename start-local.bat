@echo off
title CyberHack CTF - Local LAN Startup
color 0A
setlocal EnableDelayedExpansion

echo ========================================
echo   CYBERHACK CTF PLATFORM
echo   Local LAN Startup (No Docker)
echo ========================================
echo.

REM Step 0: Detect LAN IP
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /C:"IPv4 Address" ^| findstr /V "127.0.0"') do (
    set "LAN_IP=%%a"
    set "LAN_IP=!LAN_IP: =!"
    goto :found_ip
)
:found_ip
if not defined LAN_IP set "LAN_IP=localhost"
echo [INFO] Detected LAN IP: %LAN_IP%
echo.

REM Step 1: Check Node.js
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed! Download from https://nodejs.org
    pause
    exit /b 1
)
echo [OK] Node.js found.

REM Step 2: Install backend deps if needed
if not exist "backend\node_modules" (
    echo [INFO] Installing backend dependencies...
    cd backend
    npm install
    cd ..
)

REM Step 3: Install frontend deps if needed
if not exist "node_modules" (
    echo [INFO] Installing frontend dependencies...
    npm install
)

echo.
echo [1/2] Starting Backend (port 3001)...
start "CTF Backend" cmd /k "cd /d %~dp0backend && npm run start:dev"

REM Wait a moment for backend to initialize
timeout /t 4 /nobreak >nul

echo [2/2] Starting Frontend (port 3002)...
start "CTF Frontend" cmd /k "cd /d %~dp0 && npm run dev"

echo.
echo ========================================
echo   SERVER RUNNING (LAN MODE - No Docker)
echo ========================================
echo.
echo   LOCAL ACCESS:
echo     http://localhost:3002
echo.
echo   LAN ACCESS (share with participants):
echo     http://%LAN_IP%:3002
echo.
echo   Database: SQLite file at backend\cyberhack.db
echo   Backend:  http://%LAN_IP%:3001
echo.
echo   [INFO] Two terminal windows have opened:
echo          - CTF Backend (NestJS)
echo          - CTF Frontend (Vite)
echo   [INFO] To stop: Close those two windows.
echo   [INFO] User data is saved in backend\cyberhack.db
echo.
pause
