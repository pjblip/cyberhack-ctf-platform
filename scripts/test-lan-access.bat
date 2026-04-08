@echo off
title LAN Access Test - Mystic Flag Forge 2.0
color 0E

echo ========================================
echo   LAN ACCESS DIAGNOSTIC TEST
echo   Mystic Flag Forge 2.0
echo ========================================
echo.

echo [1/6] Detecting Your IP Address...
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4 Address"') do (
    set IP=%%a
    goto :found_ip
)
:found_ip
set IP=%IP:~1%
echo [OK] Your IP: %IP%
echo.

echo [2/6] Checking if Backend is running (port 3001)...
netstat -ano | findstr :3001 >nul
if %errorlevel% equ 0 (
    echo [OK] Backend is listening on port 3001
) else (
    echo [ERROR] Backend is NOT running!
    echo [INFO] Start backend with: cd backend ^&^& npm run start:dev
)
echo.

echo [3/6] Checking if Frontend is running (port 3002)...
netstat -ano | findstr :3002 >nul
if %errorlevel% equ 0 (
    echo [OK] Frontend is listening on port 3002
) else (
    echo [ERROR] Frontend is NOT running!
    echo [INFO] Start frontend with: npm run dev
)
echo.

echo [4/6] Checking Firewall Rules...
powershell -Command "Get-NetFirewallRule -DisplayName 'Mystic Flag Forge*' | Select-Object DisplayName, Enabled" 2>nul
if %errorlevel% equ 0 (
    echo [OK] Firewall rules exist
) else (
    echo [WARN] No firewall rules found
    echo [INFO] Run: start-both-servers.bat as Administrator
)
echo.

echo [5/6] Testing Backend API...
curl -s http://localhost:3001/challenges >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Backend API responds on localhost
) else (
    echo [ERROR] Backend API not responding
)
echo.

echo [6/6] Configuration Check...
echo.
echo Current .env.local:
type .env.local
echo.
echo.

echo ========================================
echo   TEST RESULTS
echo ========================================
echo.
echo Your IP Address: %IP%
echo.
echo URLs to test:
echo   Frontend (localhost): http://localhost:3002
echo   Frontend (LAN):       http://%IP%:3002/#/
echo   Backend (localhost):  http://localhost:3001/challenges
echo   Backend (LAN):        http://%IP%:3001/challenges
echo.
echo Next Steps:
echo   1. If backend/frontend not running, use: start-both-servers.bat
echo   2. Test on your laptop first (localhost URLs)
echo   3. Test from another device (LAN URLs)
echo.
echo ========================================
echo.
pause
