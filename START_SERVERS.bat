@echo off
title "HireGo - Install & Start All Servers"

echo ============================================
echo   HireGo AI Platform - Full Setup
echo ============================================
echo.

set ROOT=%~dp0
set SERVER=%~dp0server

echo [0/4] Freeing ports 3000 and 5179 from any hung background processes...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr /r /c:":3000 *LISTENING"') do (
    echo Killing process %%a on port 3000...
    taskkill /f /pid %%a >nul 2>&1
)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr /r /c:":5179 *LISTENING"') do (
    echo Killing process %%a on port 5179...
    taskkill /f /pid %%a >nul 2>&1
)

echo [1/4] Installing root dependencies...
cd /d "%ROOT%"
if not exist .env (
    echo Config: Creating root/.env from template...
    copy .env.example .env >nul
)
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Root npm install failed!
    pause
    exit /b 1
)

echo.
echo [2/4] Installing server dependencies...
cd /d "%SERVER%"
if not exist .env (
    echo Config: Creating server/.env from template...
    copy .env.example .env >nul
)
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Server npm install failed!
    pause
    exit /b 1
)

echo.
echo [3/4] Starting Backend Server (Port 3000)...
start "HireGo Backend :3000" cmd /k "cd /d "%SERVER%" && echo. && echo Backend starting on http://localhost:3000 && echo. && node index.js"

timeout /t 3 /nobreak >nul

echo [4/4] Starting Frontend Server (Port 5179)...
start "HireGo Frontend :5179" cmd /k "cd /d "%ROOT%" && echo. && echo Frontend starting on http://localhost:5179 && echo. && npm run dev"

echo.
echo ============================================
echo   SUCCESS! Both servers are starting!
echo.
echo   Frontend:  http://localhost:5179
echo   Backend:   http://localhost:3000
echo   Health:    http://localhost:3000/health
echo ============================================
echo.
timeout /t 8 /nobreak >nul
