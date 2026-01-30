#!/usr/bin/env python3
"""
Simple script to test database content and create test data if needed
"""
import requests
import json

BASE_URL = "https://drugchain-1.onrender.com/api/v1"

def test_verification_with_existing_data():
    """Test verification with some common pack ID patterns"""
    
    # Common pack ID patterns to try
    test_pack_ids = [
        "AX7K9M2P5N8Q3R1T",  # 16-char format
        "PK-AX7K9M2P",       # PK- prefix format
        "TEST-PACK-001",     # Test format
        "DEMO-PACK-123",     # Demo format
    ]
    
    print("=== Testing Verification with Different Pack IDs ===")
    
    for pack_id in test_pack_ids:
        print(f"\nTesting pack ID: {pack_id}")
        
        try:
            response = requests.post(
                f"{BASE_URL}/verify/pack",
                json={
                    "pack_id": pack_id,
                    "location": "Test Location",
                    "phone_number": "+2348012345678"
                },
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                print(f"  ✅ Status: {data.get('verification_result', 'Unknown')}")
                print(f"  📝 Message: {data.get('message', 'No message')}")
                
                if data.get('data'):
                    product_data = data['data']
                    print(f"  🏷️  Product: {product_data.get('product_name', 'Unknown')}")
                    print(f"  🏭 Manufacturer: {product_data.get('manufacturer', 'Unknown')}")
                    print(f"  💊 Brand: {product_data.get('brand_name', 'N/A')}")
                    print(f"  💉 Dosage: {product_data.get('dosage', 'N/A')}")
                    print(f"  📋 Form: {product_data.get('form', 'N/A')}")
                    print(f"  🌍 Country: {product_data.get('country_of_origin', 'N/A')}")
                    print(f"  📜 NAFDAC: {product_data.get('nafdac_reg', 'N/A')}")
                    
                    # Check if we're getting real data or placeholders
                    if (product_data.get('product_name') not in ['Unknown Product', 'Unknown'] and
                        product_data.get('brand_name') not in [None, 'N/A', ''] and
                        product_data.get('dosage') not in [None, 'N/A', '']):
                        print("  🎉 SUCCESS: Getting real product data!")
                        return True
                    else:
                        print("  ⚠️  Still showing placeholders/N/A values")
                else:
                    print("  ℹ️  No product data returned")
            else:
                print(f"  ❌ HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            print(f"  ❌ Error: {e}")
    
    return False

def test_products_endpoint():
    """Test the products endpoint"""
    print("\n=== Testing Products Endpoint ===")
    
    try:
        response = requests.get(f"{BASE_URL}/products/public", timeout=10)
        
        if response.status_code == 200:
            products = response.json()
            print(f"✅ Found {len(products)} products")
            
            if products:
                print("Sample product:")
                sample = products[0]
                print(f"  ID: {sample.get('product_id', 'Unknown')}")
                print(f"  Name: {sample.get('product_name', 'Unknown')}")
                print(f"  Code: {sample.get('product_code', 'Unknown')}")
                print(f"  Brand: {sample.get('brand_name', 'N/A')}")
                print(f"  Dosage: {sample.get('dosage', 'N/A')}")
                print(f"  Form: {sample.get('form', 'N/A')}")
                print(f"  Country: {sample.get('country_of_origin', 'N/A')}")
                return True
        else:
            print(f"❌ HTTP {response.status_code}: {response.text}")
            
    except Exception as e:
        print(f"❌ Error: {e}")
    
    return False

if __name__ == "__main__":
    print("🔍 Testing Database Content and Verification...")
    
    # Test products endpoint first
    products_working = test_products_endpoint()
    
    # Test verification
    verification_working = test_verification_with_existing_data()
    
    print("\n=== Summary ===")
    print(f"Products endpoint: {'✅ Working' if products_working else '❌ Failed'}")
    print(f"Verification: {'✅ Real data' if verification_working else '⚠️ Placeholders/Invalid'}")
    
    if not products_working:
        print("\n💡 The products endpoint is failing (500 error)")
        print("   This suggests missing database columns for new product fields")
        print("   Run the MINIMAL_FIX_VERIFICATION.sql script in Supabase")
    
    if not verification_working:
        print("\n💡 Verification is showing placeholders or invalid codes")
        print("   This could mean:")
        print("   1. No test data exists in the database")
        print("   2. Pack IDs have different format than expected")
        print("   3. Database relationships are missing")