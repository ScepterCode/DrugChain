#!/usr/bin/env python3
"""
Find the actual pack IDs that were generated
"""
import requests
import json

BASE_URL = "https://drugchain-1.onrender.com/api/v1"
BATCH_ID = "BT-20260130-Y1AEWY"  # From the previous run

def test_pack_id_patterns():
    """Test different pack ID patterns to find the real ones"""
    print("🔍 Searching for actual pack IDs...")
    
    # Common patterns based on the batch ID
    patterns = [
        # Direct batch-based patterns
        f"{BATCH_ID}-001",
        f"{BATCH_ID}-P001",
        f"{BATCH_ID}-PACK-001",
        
        # Shortened patterns
        f"PK-{BATCH_ID[:8]}",
        f"PK-{BATCH_ID[-6:]}",
        
        # Random-looking patterns (common in ID generation)
        "AX7K9M2P5N8Q3R1T",  # 16-char random
        "PK-AX7K9M2P",        # PK- prefix
        "BT-AX7K9M2P",        # BT- prefix
        
        # Sequential patterns
        "PK-000001",
        "PK-000002",
        "PACK-001",
        "PACK-002",
        
        # Based on batch ID components
        f"Y1AEWY-001",
        f"Y1AEWY-P01",
        f"20260130-001",
    ]
    
    valid_packs = []
    
    for pack_id in patterns:
        try:
            response = requests.post(
                f"{BASE_URL}/verify/pack",
                json={
                    "pack_id": pack_id,
                    "location": "Test Location",
                    "phone_number": "+2348012345678"
                },
                timeout=5
            )
            
            if response.status_code == 200:
                data = response.json()
                result = data.get('verification_result', 'UNKNOWN')
                
                print(f"📱 {pack_id}: {result}")
                
                # If it's not INVALID, it means the pack exists in database
                if result != 'INVALID':
                    valid_packs.append({
                        'pack_id': pack_id,
                        'result': result,
                        'data': data.get('data')
                    })
                    
                    if data.get('data'):
                        product_data = data['data']
                        print(f"   ✅ FOUND VALID PACK!")
                        print(f"   📦 Product: {product_data.get('product_name', 'Unknown')}")
                        print(f"   🏭 Manufacturer: {product_data.get('manufacturer', 'Unknown')}")
                        print(f"   💊 Brand: {product_data.get('brand_name', 'N/A')}")
                        print(f"   💉 Dosage: {product_data.get('dosage', 'N/A')}")
                        print(f"   📋 Form: {product_data.get('form', 'N/A')}")
                        print(f"   🌍 Country: {product_data.get('country_of_origin', 'N/A')}")
                        print(f"   📜 NAFDAC: {product_data.get('nafdac_reg', 'N/A')}")
                        print()
                        
        except Exception as e:
            print(f"❌ Error testing {pack_id}: {e}")
    
    return valid_packs

def check_batch_details():
    """Try to get batch details to see pack IDs"""
    print(f"\n🔍 Checking batch details for {BATCH_ID}...")
    
    try:
        # Try different endpoints that might show pack IDs
        endpoints = [
            f"/ids/batches/{BATCH_ID}",
            f"/ids/batch/{BATCH_ID}",
            f"/batches/{BATCH_ID}",
            f"/batch/{BATCH_ID}",
            f"/ids/batches/{BATCH_ID}/packs",
            f"/ids/batch/{BATCH_ID}/packs"
        ]
        
        for endpoint in endpoints:
            try:
                response = requests.get(f"{BASE_URL}{endpoint}", timeout=5)
                
                if response.status_code == 200:
                    data = response.json()
                    print(f"✅ Found endpoint: {endpoint}")
                    print(f"   Response: {json.dumps(data, indent=2)[:500]}...")
                    return data
                elif response.status_code != 404:
                    print(f"⚠️  {endpoint}: HTTP {response.status_code}")
                    
            except Exception as e:
                print(f"❌ {endpoint}: {e}")
                
    except Exception as e:
        print(f"❌ Error checking batch details: {e}")
    
    return None

def main():
    print("🔍 Finding Pack IDs from Generated Batch...")
    print(f"🏭 Batch ID: {BATCH_ID}")
    
    # First try to get batch details
    batch_details = check_batch_details()
    
    # Then test common pack ID patterns
    valid_packs = test_pack_id_patterns()
    
    print(f"\n📊 Summary:")
    print(f"   Valid packs found: {len(valid_packs)}")
    
    if valid_packs:
        print("🎉 SUCCESS! Found working pack IDs:")
        for pack in valid_packs:
            print(f"   📱 {pack['pack_id']}: {pack['result']}")
    else:
        print("⚠️  No valid pack IDs found with common patterns")
        print("   This might mean:")
        print("   1. Pack IDs use a different format")
        print("   2. Pack generation failed during batch creation")
        print("   3. Database relationships are missing")

if __name__ == "__main__":
    main()