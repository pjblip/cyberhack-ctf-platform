@echo off
REM ========================================
REM CTF Platform - Simple Start Script
REM ========================================
REM This script starts both backend and frontend servers

echo ========================================
echo CTF Platform - Simple Start
echo ========================================
echo.
echo This will start both servers:
echo - Backend (Port 3001)
echo - Frontend (Port 3002)
echo.
echo Press Ctrl+C to stop both servers
echo.
pause

REM Start backend in new window
echo Starting Backend Server...
start "CTF Backend" cmd /k "cd backend && npm run start:dev"

REM Wait a bit for backend to start
timeout /t 5 /nobreak

REM Start frontend in new window
echo Starting Frontend Server...
start "CTF Frontend" cmd /k "npm run dev"

echo.
echo ========================================
echo Servers Starting!
echo ========================================
echo.
echo Backend:  http://localhost:3001
echo Frontend: http://192.168.0.106:3002
echo.
echo Both servers are running in separate windows.
echo Close those windows to stop the servers.
echo.
pause
