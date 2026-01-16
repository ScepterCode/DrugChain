#!/usr/bin/env pwsh

# PackGuard Database Migration Script
# This script runs the performance indexes migration on the production database

Write-Host "🚀 PackGuard Database Migration Script" -ForegroundColor Green
Write-Host "=======================================" -ForegroundColor Green

# Change to backend directory
Set-Location backend

Write-Host "📍 Current directory: $(Get-Location)" -ForegroundColor Yellow

# Check if alembic is available
try {
    $alembicVersion = python -m alembic --version
    Write-Host "✅ Alembic available: $alembicVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Alembic not found. Installing..." -ForegroundColor Red
    pip install alembic
}

# Check current migration status
Write-Host "📋 Checking current migration status..." -ForegroundColor Yellow
try {
    python -m alembic current
    Write-Host "✅ Migration status retrieved" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Could not retrieve migration status: $($_.Exception.Message)" -ForegroundColor Yellow
}

# Show available migrations
Write-Host "📋 Available migrations:" -ForegroundColor Yellow
try {
    python -m alembic history
} catch {
    Write-Host "⚠️  Could not retrieve migration history: $($_.Exception.Message)" -ForegroundColor Yellow
}

# Run the migration
Write-Host "🔄 Running database migration to add performance indexes..." -ForegroundColor Yellow
try {
    python -m alembic upgrade head
    Write-Host "✅ Migration completed successfully!" -ForegroundColor Green
} catch {
    Write-Host "❌ Migration failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "This might be due to:" -ForegroundColor Yellow
    Write-Host "  - Database connection issues" -ForegroundColor Yellow
    Write-Host "  - Migration conflicts" -ForegroundColor Yellow
    Write-Host "  - Missing dependencies" -ForegroundColor Yellow
    exit 1
}

# Verify migration status after upgrade
Write-Host "🔍 Verifying migration status..." -ForegroundColor Yellow
try {
    python -m alembic current
    Write-Host "✅ Migration verification complete" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Could not verify migration status: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host "🎉 Database migration process completed!" -ForegroundColor Green
Write-Host "The performance indexes should now be active, improving analytics query speed." -ForegroundColor Green

# Return to original directory
Set-Location ..