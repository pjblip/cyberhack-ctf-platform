@echo off
setlocal EnableDelayedExpansion
title CTF Network Connectivity Test
color 0B

echo.
echo ============================================
echo   MYSTIC FLAG FORGE 2.0 — Network Test
echo ============================================
echo.

REM ── Get IP ──
set "LAN_IP="
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /C:"IPv4 Address" ^| findstr /V "127.0.0" ^| findstr /V "169.254" ^| findstr /V "192.168.137" ^| findstr "192.168"') do (
    set "LAN_IP=%%a"
    set "LAN_IP=!LAN_IP: =!"
    goto :got_ip
)
:got_ip
if not defined LAN_IP set "LAN_IP=UNKNOWN"
echo  Detected LAN IP : !LAN_IP!
echo.

REM ── Test 1: Are ports listening? ──
echo  [TEST 1] Port listening check...
echo  -- Expecting 0.0.0.0:3001 and 0.0.0.0:3002 --
netstat -ano | findstr ":3001 \|:3002 " | findstr LISTEN
if %errorlevel% neq 0 (
    echo  [FAIL] Ports 3001 or 3002 are NOT listening!
    echo  [FIX]  Start both servers: double-click START-EVENT.bat
) else (
    echo  [PASS] Ports are listening.
)
echo.

REM ── Test 2: Localhost frontend ──
echo  [TEST 2] localhost:3002 (frontend)...
curl -s -o nul -w "  HTTP Status: %%{http_code}\n" --connect-timeout 5 http://localhost:3002
echo.

REM ── Test 3: 127.0.0.1 frontend ──
echo  [TEST 3] 127.0.0.1:3002 (IPv4 loopback)...
curl -s -o nul -w "  HTTP Status: %%{http_code}\n" --connect-timeout 5 http://127.0.0.1:3002
echo.

REM ── Test 4: LAN IP frontend ──
echo  [TEST 4] !LAN_IP!:3002 (LAN access — what students use)...
curl -s -o nul -w "  HTTP Status: %%{http_code}\n" --connect-timeout 8 http://!LAN_IP!:3002
if %errorlevel% neq 0 (
    echo  [FAIL] LAN IP not reachable on port 3002
    echo  [FIX]  Run firewall-complete-fix.ps1 as Administrator
) else (
    echo  [PASS] LAN IP reachable!
)
echo.

REM ── Test 5: Backend API ──
echo  [TEST 5] !LAN_IP!:3001 (backend API)...
curl -s -o nul -w "  HTTP Status: %%{http_code}\n" --connect-timeout 8 http://!LAN_IP!:3001
echo.

REM ── Test 6: Simple test server (port 9999) ──
echo  [TEST 6] Testing bare Node.js server on port 9999...
echo  Temporarily starting test server...
start /b node test-simple-server.js > nul 2>&1
timeout /t 2 /nobreak >nul
curl -s -o nul -w "  Simple server HTTP Status: %%{http_code}\n" --connect-timeout 5 http://!LAN_IP!:9999
if %errorlevel% neq 0 (
    echo  [FAIL] Even bare Node.js server fails on !LAN_IP!
    echo  [CAUSE] Windows networking or router AP isolation
    echo  [FIX]   Use Mobile Hotspot (Settings > Network > Mobile Hotspot)
) else (
    echo  [PASS] Basic networking works — Vite config or firewall issue
)
taskkill /f /im node.exe /fi "WINDOWTITLE eq test-simple-server" >nul 2>&1
echo.

echo ============================================
echo  RESULT GUIDE:
echo  HTTP 200 or 304 = Working
echo  HTTP 000 or timeout = Firewall/not running
echo ============================================
echo.
pause
