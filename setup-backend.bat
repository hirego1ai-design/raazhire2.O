@echo off
echo ================================================
echo HireGo AI - Production API Setup Script
echo ================================================
echo.

cd server

echo [1/4] Checking if .env exists...
if exist .env (
    echo .env file found!
) else (
    echo Creating .env from template...
    copy .env.example .env
    echo.
    echo IMPORTANT: Edit server/.env and add:
    echo   - SUPABASE_URL
    echo   - SUPABASE_ANON_KEY
    echo   - ENCRYPTION_KEY (generate below)
    echo.
)

echo.
echo [2/4] Generating encryption key...
echo Copy this key to your .env file as ENCRYPTION_KEY:
echo.
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
echo.

echo [3/4] Installing dependencies...
call npm install

echo.
echo [4/4] Starting backend server...
echo Server will start on http://localhost:3000
echo.
echo Press Ctrl+C to stop the server
echo.

call npm start

pause
