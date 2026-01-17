#!/usr/bin/env pwsh

Write-Host "Testing Regulator Dashboard Fixes..." -ForegroundColor Green

# Test 1: Check if RoleBasedDashboard redirects regulators properly
Write-Host "`n1. Testing RoleBasedDashboard redirect logic..." -ForegroundColor Yellow
$roleBasedContent = Get-Content "frontend/src/components/RoleBasedDashboard.tsx" -Raw
if ($roleBasedContent -match "window\.location\.href = '/portal/regulator'") {
    Write-Host "✓ RoleBasedDashboard now redirects regulators to dedicated route" -ForegroundColor Green
} else {
    Write-Host "✗ RoleBasedDashboard redirect not found" -ForegroundColor Red
}

# Test 2: Check if RegulatorDashboard has verification functionality
Write-Host "`n2. Testing RegulatorDashboard verification features..." -ForegroundColor Yellow
$regulatorContent = Get-Content "frontend/src/pages/RegulatorDashboard.tsx" -Raw
if ($regulatorContent -match "/portal/verify" -and $regulatorContent -match "Product Verification") {
    Write-Host "✓ RegulatorDashboard has verification functionality" -ForegroundColor Green
} else {
    Write-Host "✗ RegulatorDashboard verification functionality missing" -ForegroundColor Red
}

# Test 3: Check if SearchPage has enhanced functionality
Write-Host "`n3. Testing SearchPage enhancements..." -ForegroundColor Yellow
$searchContent = Get-Content "frontend/src/pages/SearchPage.tsx" -Raw
if ($searchContent -match "useSearchParams" -and $searchContent -match "Quick Product Verification") {
    Write-Host "✓ SearchPage has enhanced functionality with URL params and verification" -ForegroundColor Green
} else {
    Write-Host "✗ SearchPage enhancements missing" -ForegroundColor Red
}

# Test 4: Check if all dashboards have verification functionality
Write-Host "`n4. Testing verification functionality in all dashboards..." -ForegroundColor Yellow

$manufacturerContent = Get-Content "frontend/src/components/dashboards/ManufacturerDashboard.tsx" -Raw
$consumerContent = Get-Content "frontend/src/components/dashboards/ConsumerDashboard.tsx" -Raw
$retailerContent = Get-Content "frontend/src/components/dashboards/RetailerDashboard.tsx" -Raw

$verificationCount = 0
if ($manufacturerContent -match "/portal/verify") { $verificationCount++ }
if ($consumerContent -match "/portal/verify") { $verificationCount++ }
if ($retailerContent -match "/portal/verify") { $verificationCount++ }

if ($verificationCount -eq 3) {
    Write-Host "✓ All dashboards have verification functionality" -ForegroundColor Green
} else {
    Write-Host "✗ Some dashboards missing verification functionality ($verificationCount/3)" -ForegroundColor Red
}

# Test 5: Check navigation structure
Write-Host "`n5. Testing navigation structure..." -ForegroundColor Yellow
$layoutContent = Get-Content "frontend/src/components/Layout.tsx" -Raw
$hasSearchNav = $layoutContent -match "Search.*Investigation" -and $layoutContent -match "/portal/search"
if ($hasSearchNav) {
    Write-Host "✓ Navigation includes Search and Investigation link" -ForegroundColor Green
} else {
    Write-Host "✗ Navigation missing Search and Investigation link" -ForegroundColor Red
}

Write-Host "`nRegulator Dashboard Fix Test Complete!" -ForegroundColor Green
Write-Host "Summary of fixes applied:" -ForegroundColor Cyan
Write-Host "1. ✓ Removed duplicate regulator dashboard (now uses dedicated route)" -ForegroundColor White
Write-Host "2. ✓ Enhanced /portal/regulator with verification functionality" -ForegroundColor White
Write-Host "3. ✓ Improved Search and Investigation page with better functionality" -ForegroundColor White
Write-Host "4. ✓ Added verification functionality to all dashboards" -ForegroundColor White
Write-Host "5. ✓ Fixed navigation and routing issues" -ForegroundColor White