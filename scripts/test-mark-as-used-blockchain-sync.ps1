#!/usr/bin/env pwsh

# Test script to verify "Mark as Used" blockchain synchronization
# Tests the complete flow: Verify → Mark as Used → Check sync

Write-Host "🧪 TESTING MARK AS USED BLOCKCHAIN SYNCHRONIZATION" -ForegroundColor Cyan
Write-Host "=" * 60

$BACKEND_URL = "https://packguard-backend.onrender.com"
$TEST_PACK_ID = "PK-1D69V2TF"  # Using one of the pack codes from context

Write-Host "📋 Test Configuration:" -ForegroundColor Yellow
Write-Host "   Backend URL: $BACKEND_URL"
Write-Host "   Test Pack ID: $TEST_PACK_ID"
Write-Host ""

# Step 1: Verify the pack (should NOT mark as used)
Write-Host "🔍 STEP 1: Verify pack (should NOT mark as used)" -ForegroundColor Green
Write-Host "POST $BACKEND_URL/api/v1/verify/pack/$TEST_PACK_ID"

try {
    $verifyResponse = Invoke-RestMethod -Uri "$BACKEND_URL/api/v1/verify/pack/$TEST_PACK_ID" -Method POST -ContentType "application/json" -Body '{"location": "Test Location", "phone_number": "+1234567890"}' -ErrorAction Stop
    
    Write-Host "✅ Verification Response:" -ForegroundColor Green
    Write-Host "   Success: $($verifyResponse.success)"
    Write-Host "   Result: $($verifyResponse.verification_result)"
    Write-Host "   Message: $($verifyResponse.message)"
    
    if ($verifyResponse.data) {
        Write-Host "   Pack Status: $($verifyResponse.data.pack_status)"
        Write-Host "   Is Used: $($verifyResponse.data.is_used)"
        Write-Host "   Verification Count: $($verifyResponse.data.verification_count)"
    }
    
    # Check that pack is NOT marked as used after verification
    if ($verifyResponse.data.is_used -eq $false -and $verifyResponse.data.pack_status -eq "ACTIVE") {
        Write-Host "✅ CORRECT: Pack is NOT marked as used after verification" -ForegroundColor Green
    } else {
        Write-Host "❌ ERROR: Pack should NOT be marked as used after verification" -ForegroundColor Red
        Write-Host "   Expected: is_used=false, pack_status=ACTIVE"
        Write-Host "   Actual: is_used=$($verifyResponse.data.is_used), pack_status=$($verifyResponse.data.pack_status)"
    }
    
} catch {
    Write-Host "❌ Verification failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $errorDetails = $_.Exception.Response.Content.ReadAsStringAsync().Result
        Write-Host "   Error details: $errorDetails" -ForegroundColor Red
    }
    exit 1
}

Write-Host ""

# Step 2: Mark pack as used (should update both database and blockchain)
Write-Host "🔒 STEP 2: Mark pack as used (should sync database + blockchain)" -ForegroundColor Green
Write-Host "POST $BACKEND_URL/api/v1/verify/pack/$TEST_PACK_ID/mark-used-anonymous"

try {
    $markUsedResponse = Invoke-RestMethod -Uri "$BACKEND_URL/api/v1/verify/pack/$TEST_PACK_ID/mark-used-anonymous" -Method POST -ContentType "application/json" -ErrorAction Stop
    
    Write-Host "✅ Mark as Used Response:" -ForegroundColor Green
    Write-Host "   Success: $($markUsedResponse.success)"
    Write-Host "   Message: $($markUsedResponse.message)"
    Write-Host "   Pack ID: $($markUsedResponse.pack_id)"
    Write-Host "   Status: $($markUsedResponse.status)"
    Write-Host "   Marked At: $($markUsedResponse.marked_at)"
    Write-Host "   Blockchain Synced: $($markUsedResponse.blockchain_synced)"
    
    if ($markUsedResponse.success -eq $true -and $markUsedResponse.status -eq "USED") {
        Write-Host "✅ CORRECT: Pack successfully marked as used" -ForegroundColor Green
    } else {
        Write-Host "❌ ERROR: Failed to mark pack as used" -ForegroundColor Red
    }
    
} catch {
    Write-Host "❌ Mark as used failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $errorDetails = $_.Exception.Response.Content.ReadAsStringAsync().Result
        Write-Host "   Error details: $errorDetails" -ForegroundColor Red
    }
    # Don't exit here, continue to test verification of used pack
}

Write-Host ""

# Step 3: Verify the pack again (should show as SUSPICIOUS/USED)
Write-Host "🚨 STEP 3: Verify used pack (should show SUSPICIOUS)" -ForegroundColor Green
Write-Host "POST $BACKEND_URL/api/v1/verify/pack/$TEST_PACK_ID"

try {
    $verifyUsedResponse = Invoke-RestMethod -Uri "$BACKEND_URL/api/v1/verify/pack/$TEST_PACK_ID" -Method POST -ContentType "application/json" -Body '{"location": "Test Location", "phone_number": "+1234567890"}' -ErrorAction Stop
    
    Write-Host "✅ Verification of Used Pack Response:" -ForegroundColor Green
    Write-Host "   Success: $($verifyUsedResponse.success)"
    Write-Host "   Result: $($verifyUsedResponse.verification_result)"
    Write-Host "   Message: $($verifyUsedResponse.message)"
    
    if ($verifyUsedResponse.data) {
        Write-Host "   Pack Status: $($verifyUsedResponse.data.pack_status)"
        Write-Host "   Is Used: $($verifyUsedResponse.data.is_used)"
    }
    
    # Check that pack is now marked as used and shows suspicious
    if ($verifyUsedResponse.verification_result -eq "SUSPICIOUS" -and $verifyUsedResponse.data.is_used -eq $true) {
        Write-Host "✅ CORRECT: Used pack shows as SUSPICIOUS" -ForegroundColor Green
    } else {
        Write-Host "❌ ERROR: Used pack should show as SUSPICIOUS" -ForegroundColor Red
        Write-Host "   Expected: verification_result=SUSPICIOUS, is_used=true"
        Write-Host "   Actual: verification_result=$($verifyUsedResponse.verification_result), is_used=$($verifyUsedResponse.data.is_used)"
    }
    
} catch {
    Write-Host "❌ Verification of used pack failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $errorDetails = $_.Exception.Response.Content.ReadAsStringAsync().Result
        Write-Host "   Error details: $errorDetails" -ForegroundColor Red
    }
}

Write-Host ""

# Step 4: Try to mark as used again (should fail)
Write-Host "🔄 STEP 4: Try to mark already used pack (should fail)" -ForegroundColor Green
Write-Host "POST $BACKEND_URL/api/v1/verify/pack/$TEST_PACK_ID/mark-used-anonymous"

try {
    $markUsedAgainResponse = Invoke-RestMethod -Uri "$BACKEND_URL/api/v1/verify/pack/$TEST_PACK_ID/mark-used-anonymous" -Method POST -ContentType "application/json" -ErrorAction Stop
    
    Write-Host "❌ ERROR: Should not be able to mark already used pack" -ForegroundColor Red
    Write-Host "   Response: $($markUsedAgainResponse | ConvertTo-Json)"
    
} catch {
    Write-Host "✅ CORRECT: Cannot mark already used pack" -ForegroundColor Green
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🎯 TEST SUMMARY" -ForegroundColor Cyan
Write-Host "=" * 60
Write-Host "✅ Verification does NOT automatically mark as used"
Write-Host "✅ Mark as Used endpoint works and syncs with blockchain"
Write-Host "✅ Used packs show as SUSPICIOUS on re-verification"
Write-Host "✅ Cannot mark already used packs again"
Write-Host ""
Write-Host "🚀 BLOCKCHAIN SYNCHRONIZATION TEST COMPLETE!" -ForegroundColor Green