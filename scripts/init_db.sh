#!/bin/bash
# Database initialization script for DrugChain

echo "========================================="
echo "DrugChain Database Setup"
echo "========================================="
echo ""

# Check if PostgreSQL is running
echo "Checking PostgreSQL connection..."
python -c "import psycopg2; psycopg2.connect('postgresql://drugchain_user:your_password@localhost:5432/postgres')" 2>/dev/null

if [ $? -ne 0 ]; then
    echo "ERROR: Cannot connect to PostgreSQL"
    echo "Please ensure PostgreSQL is running and credentials are correct in .env file"
    exit 1
fi

echo "✓ PostgreSQL connection successful"
echo ""

# Create database if it doesn't exist
echo "Creating database 'drugchain_db' if not exists..."
python -c "
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

conn = psycopg2.connect('postgresql://drugchain_user:your_password@localhost:5432/postgres')
conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
cursor = conn.cursor()

cursor.execute('SELECT 1 FROM pg_database WHERE datname = %s', ('drugchain_db',))
if not cursor.fetchone():
    cursor.execute('CREATE DATABASE drugchain_db')
    print('Database created')
else:
    print('Database already exists')

cursor.close()
conn.close()
"

echo ""

# Run Alembic migrations
echo "Running database migrations..."
cd backend
alembic upgrade head

if [ $? -eq 0 ]; then
    echo "✓ Migrations completed successfully"
else
    echo "ERROR: Migration failed"
    exit 1
fi

echo ""
echo "========================================="
echo "Database setup complete!"
echo "========================================="
echo ""
echo "You can now start the application with:"
echo "  uvicorn app.main:app --reload"
