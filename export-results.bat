@echo off
REM ========================================
REM CTF Platform - Export Results Script
REM ========================================
REM This script exports final scores and statistics

echo ========================================
echo CTF Results Export
echo ========================================
echo.

REM Get current timestamp
for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set datetime=%%I
set TIMESTAMP=%datetime:~0,8%-%datetime:~8,6%

REM Create exports directory
if not exist "exports" mkdir exports

echo Exporting results to: exports\ctf-results-%TIMESTAMP%.txt
echo.

REM Export to file
(
    echo ========================================
    echo CTF EVENT RESULTS
    echo ========================================
    echo Export Date: %date% %time%
    echo.
    echo ========================================
    echo FINAL LEADERBOARD
    echo ========================================
    echo.
    
    REM Export leaderboard
    sqlite3 backend\cyberhack.db "SELECT ROW_NUMBER() OVER (ORDER BY points DESC) as Rank, username as Username, points as Points, (SELECT COUNT(*) FROM solves WHERE user_id = users.id) as Solved FROM users WHERE role != 'admin' ORDER BY points DESC;"
    
    echo.
    echo ========================================
    echo CHALLENGE STATISTICS
    echo ========================================
    echo.
    
    REM Export challenge stats
    sqlite3 backend\cyberhack.db "SELECT title as Challenge, difficulty as Difficulty, points as Points, (SELECT COUNT(*) FROM solves WHERE challenge_id = challenges.id) as Solves FROM challenges ORDER BY difficulty, title;"
    
    echo.
    echo ========================================
    echo EVENT STATISTICS
    echo ========================================
    echo.
    
    REM Total users
    echo Total Participants:
    sqlite3 backend\cyberhack.db "SELECT COUNT(*) FROM users WHERE role != 'admin';"
    
    echo.
    echo Total Solves:
    sqlite3 backend\cyberhack.db "SELECT COUNT(*) FROM solves;"
    
    echo.
    echo Total Challenges:
    sqlite3 backend\cyberhack.db "SELECT COUNT(*) FROM challenges;"
    
    echo.
    echo ========================================
    echo TOP 10 PARTICIPANTS
    echo ========================================
    echo.
    
    sqlite3 backend\cyberhack.db "SELECT username, points, (SELECT COUNT(*) FROM solves WHERE user_id = users.id) as solved FROM users WHERE role != 'admin' ORDER BY points DESC LIMIT 10;"
    
    echo.
    echo ========================================
    echo END OF REPORT
    echo ========================================
) > exports\ctf-results-%TIMESTAMP%.txt

echo.
echo ========================================
echo Export Complete!
echo ========================================
echo.
echo Results saved to: exports\ctf-results-%TIMESTAMP%.txt
echo.
echo Opening file...
notepad exports\ctf-results-%TIMESTAMP%.txt

pause
