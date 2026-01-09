@echo off
REM Database initialization script for DrugChain (Windows)

echo =========================================
echo DrugChain Database Setup
echo =========================================
echo.

echo Checking Python installation...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Python is not installed or not in PATH
    pause
    exit /b 1
)
echo [OK] Python found
echo.

echo Checking PostgreSQL connection...
python -c "import psycopg2; conn = psycopg2.connect('postgresql://drugchain_user:drugchain_password@localhost:5432/postgres'); conn.close(); print('Connected')" 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Cannot connect to PostgreSQL
    echo Please ensure PostgreSQL is running and update credentials in backend\.env
    echo Default connection: postgresql://drugchain_user:drugchain_password@localhost:5432/postgres
    pause
    exit /b 1
)
echo [OK] PostgreSQL connection successful
echo.

echo Creating database if not exists...
python scripts\create_db.py
echo.

echo Running Alembic migrations...
cd backend
python -m alembic upgrade head

if %errorlevel% equ 0 (
    echo [OK] Migrations completed successfully
) else (
    echo ERROR: Migration failed
    cd ..
    pause
    exit /b 1
)

cd ..

echo.
echo =========================================
echo Database setup complete!
echo =========================================
echo.
echo Next steps:
echo 1. Start backend: cd backend ^&^& uvicorn app.main:app --reload
echo 2. Access API docs: http://localhost:8000/api/docs
echo.
pause
