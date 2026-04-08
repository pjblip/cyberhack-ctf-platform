@echo off
REM ========================================
REM CTF Platform - Database Backup Script
REM ========================================
REM This script backs up the database every hour during the event

echo ========================================
echo CTF Database Backup Script
echo ========================================
echo.
echo This will backup the database every hour
echo Press Ctrl+C to stop
echo.
pause

:BACKUP_LOOP

REM Get current date and time
for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set datetime=%%I
set TIMESTAMP=%datetime:~0,8%-%datetime:~8,6%

REM Create backup directory if it doesn't exist
if not exist "backend\backups" mkdir backend\backups

REM Backup the database
echo [%date% %time%] Creating backup...
copy backend\cyberhack.db backend\backups\cyberhack-%TIMESTAMP%.db

if %ERRORLEVEL% EQU 0 (
    echo [%date% %time%] Backup successful: cyberhack-%TIMESTAMP%.db
) else (
    echo [%date% %time%] Backup FAILED!
)

echo.
echo Next backup in 1 hour...
echo Press Ctrl+C to stop
echo.

REM Wait 1 hour (3600 seconds)
timeout /t 3600 /nobreak

goto BACKUP_LOOP
