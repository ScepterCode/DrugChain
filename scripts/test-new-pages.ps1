#!/usr/bin/env pwsh

# Test the new About and How to Use pages

Write-Host "Testing new pages on DrugChain website..." -ForegroundColor Green

$baseUrl = "https://drug-chain.vercel.app"

# Test About page
Write-Host "`nTesting About page..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/about" -Method GET -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "✓ About page is accessible" -ForegroundColor Green
        
        # Check for key content
        if ($response.Content -match "About DrugChain" -and $response.Content -match "Our Mission") {
            Write-Host "✓ About page contains expected content" -ForegroundColor Green
        } else {
            Write-Host "? About page loaded but content may be incomplete" -ForegroundColor Yellow
        }
    }
} catch {
    Write-Host "✗ About page failed to load: $($_.Exception.Message)" -ForegroundColor Red
}

# Test How to Use page
Write-Host "`nTesting How to Use page..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/how-to-use" -Method GET -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "✓ How to Use page is accessible" -ForegroundColor Green
        
        # Check for key content
        if ($response.Content -match "How to Use DrugChain" -and $response.Content -match "Manufacturer") {
            Write-Host "✓ How to Use page contains expected content" -ForegroundColor Green
        } else {
            Write-Host "? How to Use page loaded but content may be incomplete" -ForegroundColor Yellow
        }
    }
} catch {
    Write-Host "✗ How to Use page failed to load: $($_.Exception.Message)" -ForegroundColor Red
}

# Test navigation links on landing page
Write-Host "`nTesting navigation links..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/" -Method GET -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "✓ Landing page is accessible" -ForegroundColor Green
        
        # Check for navigation links
        if ($response.Content -match 'href="/about"' -and $response.Content -match 'href="/how-to-use"') {
            Write-Host "✓ Navigation links are present on landing page" -ForegroundColor Green
        } else {
            Write-Host "? Navigation links may not be properly added" -ForegroundColor Yellow
        }
    }
} catch {
    Write-Host "✗ Landing page failed to load: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nPage testing completed!" -ForegroundColor Green
Write-Host "Visit the pages directly:" -ForegroundColor Cyan
Write-Host "- About: $baseUrl/about" -ForegroundColor White
Write-Host "- How to Use: $baseUrl/how-to-use" -ForegroundColor White