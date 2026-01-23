# Simple Auth Security Migration Script
Write-Host "Auth Security Migration (Simple Approach)" -ForegroundColor Cyan
Write-Host ""

$DB_HOST = "aws-1-eu-west-1.pooler.supabase.com"
$DB_PORT = "5432"
$DB_NAME = "postgres"
$DB_USER = "postgres.aykzdgvdzmjhwsbjazon"
$DB_PASSWORD = "vh1RGEOTKO0d5cKN"

$env:PGPASSWORD = $DB_PASSWORD

Write-Host "Adding columns one by one..." -ForegroundColor Yellow
Write-Host ""

$columns = @(
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verification_token VARCHAR(255);",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verification_token_expires TIMESTAMP;",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS password_reset_token VARCHAR(255);",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS password_reset_token_expires TIMESTAMP;",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS password_changed_at TIMESTAMP;",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER DEFAULT 0;",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS account_locked_until TIMESTAMP;"
)

foreach ($sql in $columns) {
    Write-Host "Executing: $sql" -ForegroundColor Gray
    $result = & psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c $sql 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Success" -ForegroundColor Green
    } else {
        Write-Host "Failed: $result" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "Creating audit_logs table..." -ForegroundColor Yellow
$auditTableSQL = @"
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(user_id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50),
    resource_id VARCHAR(255),
    ip_address VARCHAR(45),
    user_agent VARCHAR(500),
    details JSONB,
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL
);
"@

$result = & psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c $auditTableSQL 2>&1
Write-Host $result

Write-Host ""
Write-Host "Creating indexes..." -ForegroundColor Yellow
$indexes = @(
    "CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);",
    "CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);",
    "CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);"
)

foreach ($sql in $indexes) {
    $result = & psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c $sql 2>&1
    Write-Host $result
}

Write-Host ""
Write-Host "Verifying columns..." -ForegroundColor Yellow
$verifySQL = "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'users' AND column_name IN ('email_verification_token', 'password_reset_token', 'failed_login_attempts', 'account_locked_until') ORDER BY column_name;"
$result = & psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c $verifySQL 2>&1
Write-Host $result

Write-Host ""
Write-Host "Migration complete!" -ForegroundColor Green

$env:PGPASSWORD = $null
