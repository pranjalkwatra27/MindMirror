@echo off
REM HireMind - Setup Script for Windows
REM This script automates the initial setup of HireMind

echo.
echo 🧠 HireMind - AI Interview + Placement Prep Coach
echo ==================================================
echo.

REM Check Node.js
echo ✓ Checking Node.js installation...
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js not found. Please install from https://nodejs.org
    exit /b 1
)
for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo   Node version: %NODE_VERSION%
echo.

REM Check npm
echo ✓ Checking npm installation...
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ npm not found. Please install Node.js with npm
    exit /b 1
)
for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
echo   npm version: %NPM_VERSION%
echo.

REM Navigate to backend
cd /d backend || exit /b 1

REM Install dependencies
echo 📦 Installing backend dependencies...
call npm install
echo ✓ Dependencies installed
echo.

REM Check .env file
if not exist .env (
    echo ⚠️  .env file not found
    echo.
    echo Create backend\.env with:
    echo.
    echo MONGODB_URI=mongodb://localhost:27017/hiremind
    echo JWT_SECRET=your_super_secret_jwt_key_here
    echo JWT_EXPIRE=7d
    echo GEMINI_API_KEY=your_gemini_api_key_here
    echo PORT=3000
    echo NODE_ENV=development
    echo FRONTEND_URL=http://localhost:5500
    echo.
    echo Get GEMINI_API_KEY from: https://aistudio.google.com/
    echo.
) else (
    echo ✓ .env file found
)

echo.
echo 🚀 Setup Complete!
echo.
echo Next steps:
echo 1. Start MongoDB: mongod (or use MongoDB Atlas URL in .env^)
echo 2. Start backend: npm start (in backend\ directory^)
echo 3. Start frontend: python -m http.server 5500 (in frontend\ directory^)
echo 4. Open browser: http://localhost:5500
echo.
pause
