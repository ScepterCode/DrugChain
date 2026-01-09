@echo off
echo ============================================
echo DrugChain MVP - Quick Start Script
echo ============================================
echo.

echo Checking prerequisites...
echo.

REM Check Python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python is not installed or not in PATH
    echo Please install Python 3.11+ from python.org
    pause
    exit /b 1
)
echo [OK] Python found

REM Check Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not in PATH
    echo Please install Node.js 18+ from nodejs.org
    pause
    exit /b 1
)
echo [OK] Node.js found

REM Check Docker
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARNING] Docker is not installed
    echo For full setup, install Docker Desktop
) else (
    echo [OK] Docker found
)

echo.
echo ============================================
echo What would you like to do?
echo ============================================
echo 1. Setup Backend (FastAPI)
echo 2. Setup Frontend (React)
echo 3. Start with Docker (All Services)
echo 4. Run Backend Only
echo 5. Run Frontend Only
echo 6. Exit
echo.

set /p choice="Enter your choice (1-6): "

if "%choice%"=="1" goto setup_backend
if "%choice%"=="2" goto setup_frontend
if "%choice%"=="3" goto docker_start
if "%choice%"=="4" goto run_backend
if "%choice%"=="5" goto run_frontend
if "%choice%"=="6" exit /b 0

echo Invalid choice
pause
exit /b 1

:setup_backend
echo.
echo Setting up Backend...
cd backend
if not exist venv (
    echo Creating virtual environment...
    python -m venv venv
)
echo Activating virtual environment...
call venv\Scripts\activate
echo Installing dependencies...
pip install -r requirements.txt
if not exist .env (
    echo Creating .env file...
    copy .env.example .env
    echo Please edit backend\.env with your configuration
)
echo.
echo Backend setup complete!
echo Run 'cd backend && venv\Scripts\activate && uvicorn app.main:app --reload' to start
pause
exit /b 0

:setup_frontend
echo.
echo Setting up Frontend...
cd frontend
echo Installing dependencies...
call npm install
echo.
echo Frontend setup complete!
echo Run 'cd frontend && npm run dev' to start
pause
exit /b 0

:docker_start
echo.
echo Starting all services with Docker...
docker-compose up -d
echo.
echo Services starting...
echo - Backend API: http://localhost:8000
echo - API Docs: http://localhost:8000/api/docs
echo - Frontend: http://localhost:3000
echo.
echo Run 'docker-compose logs -f' to view logs
pause
exit /b 0

:run_backend
echo.
echo Starting Backend...
cd backend
call venv\Scripts\activate
uvicorn app.main:app --reload
exit /b 0

:run_frontend
echo.
echo Starting Frontend...
cd frontend
npm run dev
exit /b 0
