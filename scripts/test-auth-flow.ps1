#!/usr/bin/env pwsh

Write-Host "=== Testing PackGuard Authentication Flow ===" -ForegroundColor Cyan

$baseUrl = "https://drugchain-1.onrender.com/api/v1"
$frontendUrl = "https://pack-guard.vercel.app"

# Test data
$testUser = @{
    email = "test-auth-$(Get-Random)@example.com"
    password = "TestPass123!"
    full_name = "Test User Auth"
    phone_number = "+2348012345678"
    role = "MANUFACTURER"
    organization_name = "Test Pharma Ltd"
    organization_type = "MANUFACTURER"
    registration_number = "RC123456"
}

Write-Host "`n1. Testing User Registration..." -ForegroundColor Yellow

try {
    $registerResponse = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method POST -Body ($testUser | ConvertTo-Json) -ContentType "application/json"
    Write-Host "✅ Registration successful!" -ForegroundColor Green
    Write-Host "User ID: $($registerResponse.data.user.user_id)" -ForegroundColor Gray
    Write-Host "Email: $($registerResponse.data.user.email)" -ForegroundColor Gray
    Write-Host "Role: $($registerResponse.data.user.role)" -ForegroundColor Gray
    Write-Host "Verified: $($registerResponse.data.user.is_verified)" -ForegroundColor Gray
    
    $accessToken = $registerResponse.data.access_token
    Write-Host "Access token received: $($accessToken.Substring(0, 20))..." -ForegroundColor Gray
} catch {
    Write-Host "❌ Registration failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $errorBody = $_.Exception.Response.Content.ReadAsStringAsync().Result
        Write-Host "Error details: $errorBody" -ForegroundColor Red
    }
    exit 1
}

Write-Host "`n2. Testing Login..." -ForegroundColor Yellow

try {
    $loginData = @{
        username = $testUser.email
        password = $testUser.password
    }
    
    $formData = "username=$($loginData.username)&password=$($loginData.password)"
    
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $formData -ContentType "application/x-www-form-urlencoded"
    Write-Host "✅ Login successful!" -ForegroundColor Green
    Write-Host "Token type: $($loginResponse.token_type)" -ForegroundColor Gray
    
    $loginToken = $loginResponse.access_token
    Write-Host "New access token: $($loginToken.Substring(0, 20))..." -ForegroundColor Gray
} catch {
    Write-Host "❌ Login failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $errorBody = $_.Exception.Response.Content.ReadAsStringAsync().Result
        Write-Host "Error details: $errorBody" -ForegroundColor Red
    }
}

Write-Host "`n3. Testing Get Current User..." -ForegroundColor Yellow

try {
    $headers = @{
        "Authorization" = "Bearer $loginToken"
    }
    
    $userResponse = Invoke-RestMethod -Uri "$baseUrl/auth/me" -Method GET -Headers $headers
    Write-Host "✅ Get current user successful!" -ForegroundColor Green
    Write-Host "User ID: $($userResponse.user_id)" -ForegroundColor Gray
    Write-Host "Email: $($userResponse.email)" -ForegroundColor Gray
    Write-Host "Full Name: $($userResponse.full_name)" -ForegroundColor Gray
    Write-Host "Role: $($userResponse.role)" -ForegroundColor Gray
    Write-Host "Organization ID: $($userResponse.organization_id)" -ForegroundColor Gray
    Write-Host "Verified: $($userResponse.is_verified)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Get current user failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $errorBody = $_.Exception.Response.Content.ReadAsStringAsync().Result
        Write-Host "Error details: $errorBody" -ForegroundColor Red
    }
}

Write-Host "`n4. Testing Protected Endpoint (Products)..." -ForegroundColor Yellow

try {
    $headers = @{
        "Authorization" = "Bearer $loginToken"
    }
    
    $productsResponse = Invoke-RestMethod -Uri "$baseUrl/products" -Method GET -Headers $headers
    Write-Host "✅ Protected endpoint access successful!" -ForegroundColor Green
    Write-Host "Products count: $($productsResponse.Count)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Protected endpoint failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $errorBody = $_.Exception.Response.Content.ReadAsStringAsync().Result
        Write-Host "Error details: $errorBody" -ForegroundColor Red
    }
}

Write-Host "`n5. Testing Invalid Token..." -ForegroundColor Yellow

try {
    $headers = @{
        "Authorization" = "Bearer invalid-token-12345"
    }
    
    $invalidResponse = Invoke-RestMethod -Uri "$baseUrl/auth/me" -Method GET -Headers $headers
    Write-Host "❌ Invalid token should have failed!" -ForegroundColor Red
} catch {
    Write-Host "✅ Invalid token correctly rejected!" -ForegroundColor Green
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Gray
}

Write-Host "`n6. Testing Frontend URLs..." -ForegroundColor Yellow

$frontendPages = @(
    "/login",
    "/register", 
    "/forgot-password",
    "/portal/dashboard"
)

foreach ($page in $frontendPages) {
    try {
        $response = Invoke-WebRequest -Uri "$frontendUrl$page" -Method GET -UseBasicParsing
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ $page - Status: $($response.StatusCode)" -ForegroundColor Green
        } else {
            Write-Host "⚠️ $page - Status: $($response.StatusCode)" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "❌ $page - Failed: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n=== Authentication Flow Test Complete ===" -ForegroundColor Cyan
Write-Host "Frontend: $frontendUrl" -ForegroundColor Gray
Write-Host "Backend: $baseUrl" -ForegroundColor Gray