# Auth Security Migration Script
Write-Host "Auth Security Migration" -ForegroundColor Cyan
Write-Host ""

$DB_HOST = "aws-1-eu-west-1.pooler.supabase.com"
$DB_PORT = "5432"
$DB_NAME = "postgres"
$DB_USER = "postgres.aykzdgvdzmjhwsbjazon"
$DB_PASSWORD = "vh1RGEOTKO0d5cKN"

$env:PGPASSWORD = $DB_PASSWORD

Write-Host "Testing database connection..." -ForegroundColor Yellow
$testQuery = "SELECT version();"
$testResult = & psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c $testQuery 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "Database connection successful!" -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host "Database connection failed!" -ForegroundColor Red
    Write-Host $testResult
    exit 1
}

Write-Host "Running migration..." -ForegroundColor Yellow
$sqlFile = "backend\add_auth_security_columns.sql"

if (Test-Path $sqlFile) {
    $migrationResult = & psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f $sqlFile 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Migration completed!" -ForegroundColor Green
        Write-Host $migrationResult
    } else {
        Write-Host "Migration failed!" -ForegroundColor Red
        Write-Host $migrationResult
        exit 1
    }
} else {
    Write-Host "SQL file not found: $sqlFile" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Verifying migration..." -ForegroundColor Yellow
$verifyQuery = "SELECT column_name FROM information_schema.columns WHERE table_name = 'users' AND column_name LIKE '%verification%' OR column_name LIKE '%reset%' OR column_name LIKE '%locked%';"
$verifyResult = & psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c $verifyQuery 2>&1

Write-Host $verifyResult
Write-Host ""
Write-Host "Migration complete!" -ForegroundColor Green

$env:PGPASSWORD = $null
