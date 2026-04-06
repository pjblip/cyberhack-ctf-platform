@echo off
REM ========================================
REM CTF Platform - Hosts File Setup
REM ========================================
REM This adds ctf.local to Windows hosts file

echo ========================================
echo CTF Platform - Hosts File Setup
echo ========================================
echo.
echo This will add ctf.local to your hosts file
echo You need to run this as Administrator!
echo.
echo After setup, you can access the CTF at:
echo http://ctf.local:3002
echo.
pause

REM Check for admin rights
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo.
    echo ERROR: This script requires Administrator privileges!
    echo.
    echo Please:
    echo 1. Right-click this file
    echo 2. Select "Run as administrator"
    echo.
    pause
    exit /b 1
)

echo Adding ctf.local to hosts file...
echo.

REM Add entry to hosts file
echo 192.168.0.106  ctf.local >> C:\Windows\System32\drivers\etc\hosts

if %ERRORLEVEL% EQU 0 (
    echo ========================================
    echo Setup Complete!
    echo ========================================
    echo.
    echo You can now access the CTF platform at:
    echo http://ctf.local:3002
    echo.
    echo Opening browser...
    start http://ctf.local:3002
) else (
    echo.
    echo ERROR: Failed to update hosts file!
    echo Please check permissions and try again.
)

echo.
pause
