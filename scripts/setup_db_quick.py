"""
Quick database setup script - creates database and runs migrations
"""
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
import subprocess
import os

# Try to connect with default postgres credentials
conn_string = "postgresql://postgres:postgres@localhost:5432/postgres"
db_name = "drugchain_db"

try:
    print("Connecting to PostgreSQL...")
    conn = psycopg2.connect(conn_string)
    conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
    cursor = conn.cursor()
    
    # Check if database exists
    cursor.execute(f"SELECT 1 FROM pg_database WHERE datname = '{db_name}'")
    exists = cursor.fetchone()
    
    if not exists:
        print(f"Creating database '{db_name}'...")
        cursor.execute(f'CREATE DATABASE {db_name}')
        print(f"✓ Database '{db_name}' created successfully")
    else:
        print(f"✓ Database '{db_name}' already exists")
    
    cursor.close()
    conn.close()
    
    # Run Alembic migrations
    print("\nRunning database migrations...")
    os.chdir("backend")
    
    # Set environment variable for database URL
    os.environ['DATABASE_URL'] = f"postgresql://postgres:postgres@localhost:5432/{db_name}"
    
    result = subprocess.run(
        ["python", "-m", "alembic", "upgrade", "head"],
        capture_output=True,
        text=True
    )
    
    if result.returncode == 0:
        print("✓ Migrations completed successfully!")
        print("\nDatabase is ready!")
        print("\nYou can now:")
        print("1. Register via frontend: http://localhost:5173")
        print("2. Use API docs: http://localhost:8000/api/docs")
    else:
        print(f"✗ Migration failed: {result.stderr}")
        
except psycopg2.Error as e:
    print(f"✗ Database error: {e}")
    print("\nTrying alternative connection...")
    print("Please ensure PostgreSQL is running and accessible")
except Exception as e:
    print(f"✗ Error: {e}")
