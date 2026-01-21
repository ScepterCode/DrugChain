# Script to check if cartons exist in the database
# Run this to see what carton IDs are available for testing

$API_URL = "https://drugchain-1.onrender.com/api/v1"

Write-Host "=== Checking for Cartons in Database ===" -ForegroundColor Cyan
Write-Host ""

# You'll need to replace this with your actual auth token
Write-Host "To get carton IDs:" -ForegroundColor Yellow
Write-Host "1. Log in as manufacturer at: https://pack-guard.vercel.app/login"
Write-Host "2. Go to: https://pack-guard.vercel.app/portal/batches"
Write-Host "3. Click on any batch to see its carton IDs"
Write-Host "4. Copy a carton ID (format: CT-XXXXX-XXXX)"
Write-Host "5. Try verifying that carton ID"
Write-Host ""

Write-Host "Example carton ID format: CT-AMOX500-20260103-00001-0001" -ForegroundColor Green
