@echo off
REM MindMirror - Setup Script for Windows
REM Automates dependencies and setup for MindMirror

echo.
echo 🧠 MindMirror - AI Interview + Placement Prep Coach
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

REM Install dependencies
echo 📦 Installing root, backend, and frontend dependencies...
call npm install
cd backend && call npm install && cd ..
cd frontend && call npm install && cd ..
echo ✓ Dependencies installed successfully.
echo.

echo.
echo 🚀 Setup Complete!
echo.
echo To run the full application:
echo   npm run dev
echo.
echo - Frontend: http://localhost:3000
echo - Backend:  http://localhost:5001
echo.
pause
