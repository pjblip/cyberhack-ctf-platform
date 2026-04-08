@echo off
REM ========================================
REM CTF Platform - Server Monitor Script
REM ========================================
REM This script checks if the servers are running

:MONITOR_LOOP

cls
echo ========================================
echo CTF Server Monitor
echo ========================================
echo.
echo Checking servers at %date% %time%
echo.

REM Check Backend (Port 3001)
echo [Backend] Checking http://localhost:3001/api/challenges
curl -s -o nul -w "Backend Status: %%{http_code}\n" http://localhost:3001/api/challenges

if %ERRORLEVEL% EQU 0 (
    echo Backend: RUNNING ✓
) else (
    echo Backend: DOWN ✗
    echo WARNING: Backend is not responding!
)

echo.

REM Check Frontend (Port 3002)
echo [Frontend] Checking http://localhost:3002
curl -s -o nul -w "Frontend Status: %%{http_code}\n" http://localhost:3002

if %ERRORLEVEL% EQU 0 (
    echo Frontend: RUNNING ✓
) else (
    echo Frontend: DOWN ✗
    echo WARNING: Frontend is not responding!
)

echo.
echo ========================================
echo Next check in 30 seconds...
echo Press Ctrl+C to stop monitoring
echo ========================================
echo.

REM Wait 30 seconds
timeout /t 30 /nobreak

goto MONITOR_LOOP
