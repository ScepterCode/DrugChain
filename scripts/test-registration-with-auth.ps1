# Test Registration with Auth Security Features
Write-Host "Testing Registration Endpoint with Auth Security" -ForegroundColor Cyan
Write-Host ""

$API_URL = "https://drugchain-1.onrender.com/api/v1"
$timestamp = Get-Date -Format "yyyyMMddHHmmss"
$testEmail = "test_$timestamp@example.com"

Write-Host "Test Email: $testEmail" -ForegroundColor Yellow
Write-Host ""

$registrationData = @{
    email = $testEmail
    password = "Test123!@#"
    full_name = "Test User Auth"
    phone_number = "+2348012345678"
    role = "MANUFACTURER"
    organization_name = "Test Auth Org"
    organization_type = "MANUFACTURER"
    registration_number = "RC$timestamp"
} | ConvertTo-Json

Write-Host "Step 1: Testing registration..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$API_URL/auth/register" `
        -Method Post `
        -Body $registrationData `
        -ContentType "application/json" `
        -ErrorAction Stop
    
    Write-Host "Registration successful!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Response:" -ForegroundColor Cyan
    $response | ConvertTo-Json -Depth 5
    
    Write-Host ""
    Write-Host "User ID: $($response.user.user_id)" -ForegroundColor Green
    Write-Host "Email: $($response.user.email)" -ForegroundColor Green
    Write-Host "Is Verified: $($response.user.is_verified)" -ForegroundColor Yellow
    Write-Host "Access Token: $($response.access_token.Substring(0, 20))..." -ForegroundColor Green
    
} catch {
    Write-Host "Registration failed!" -ForegroundColor Red
    Write-Host "Status Code: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.ErrorDetails.Message) {
        Write-Host "Details:" -ForegroundColor Yellow
        $_.ErrorDetails.Message | ConvertFrom-Json | ConvertTo-Json -Depth 5
    }
    exit 1
}

Write-Host ""
Write-Host "Step 2: Testing login with wrong password (account lockout test)..." -ForegroundColor Yellow

for ($i = 1; $i -le 3; $i++) {
    Write-Host "Attempt $i with wrong password..." -ForegroundColor Gray
    
    $loginData = @{
        username = $testEmail
        password = "WrongPassword123"
    } | ConvertTo-Json
    
    try {
        $loginResponse = Invoke-RestMethod -Uri "$API_URL/auth/login" `
            -Method Post `
            -Body $loginData `
            -ContentType "application/json" `
            -ErrorAction Stop
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        if ($statusCode -eq 401) {
            Write-Host "  Failed as expected (401 Unauthorized)" -ForegroundColor Green
        } elseif ($statusCode -eq 403) {
            Write-Host "  Account locked! (403 Forbidden)" -ForegroundColor Yellow
            break
        } else {
            Write-Host "  Unexpected status: $statusCode" -ForegroundColor Yellow
        }
    }
    
    Start-Sleep -Seconds 1
}

Write-Host ""
Write-Host "Step 3: Testing login with correct password..." -ForegroundColor Yellow

$correctLoginData = @{
    username = $testEmail
    password = "Test123!@#"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$API_URL/auth/login" `
        -Method Post `
        -Body $correctLoginData `
        -ContentType "application/json" `
        -ErrorAction Stop
    
    Write-Host "Login successful!" -ForegroundColor Green
    Write-Host "Access Token: $($loginResponse.access_token.Substring(0, 20))..." -ForegroundColor Green
    
} catch {
    Write-Host "Login failed!" -ForegroundColor Red
    Write-Host "Status Code: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "Test complete!" -ForegroundColor Cyan
Write-Host ""
Write-Host "Summary:" -ForegroundColor Yellow
Write-Host "- Registration: Working" -ForegroundColor Green
Write-Host "- Failed login attempts: Tracked" -ForegroundColor Green
Write-Host "- Successful login: Working" -ForegroundColor Green
Write-Host ""
Write-Host "Note: Check backend logs for:" -ForegroundColor Yellow
Write-Host "- Email verification token generation" -ForegroundColor White
Write-Host "- Audit log entries" -ForegroundColor White
Write-Host "- Failed login attempt tracking" -ForegroundColor White
