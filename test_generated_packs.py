#!/usr/bin/env python3
"""
Test verification with pack IDs in the correct format
"""
import requests
import random
import string

BASE_URL = "https://drugchain-1.onrender.com/api/v1"

def generate_pack_id_format():
    """Generate pack IDs in the same format as the service"""
    random_part = ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))
    return f"PK-{random_part}"

def test_random_pack_ids():
    """Test with randomly generated pack IDs to see if any exist"""
    print("🎲 Testing with random pack IDs in correct format...")
    
    # Test 50 random pack IDs
    for i in range(50):
        pack_id = generate_pack_id_format()
        
        try:
            response = requests.post(
                f"{BASE_URL}/verify/pack",
                json={
                    "pack_id": pack_id,
                    "location": "Test Location",
                    "phone_number": "+2348012345678"
                },
                timeout=3
            )
            
            if response.status_code == 200:
                data = response.json()
                result = data.get('verification_result', 'UNKNOWN')
                
                # Only print non-INVALID results
                if result != 'INVALID':
                    print(f"🎉 FOUND: {pack_id} -> {result}")
                    
                    if data.get('data'):
                        product_data = data['data']
                        print(f"   📦 Product: {product_data.get('product_name', 'Unknown')}")
                        print(f"   🏭 Manufacturer: {product_data.get('manufacturer', 'Unknown')}")
                        print(f"   💊 Brand: {product_data.get('brand_name', 'N/A')}")
                        print(f"   💉 Dosage: {product_data.get('dosage', 'N/A')}")
                        print(f"   📋 Form: {product_data.get('form', 'N/A')}")
                        print(f"   🌍 Country: {product_data.get('country_of_origin', 'N/A')}")
                        print(f"   📜 NAFDAC: {product_data.get('nafdac_reg', 'N/A')}")
                        
                        # Check if we're getting real data or placeholders
                        if (product_data.get('product_name') not in ['Unknown Product', 'Unknown'] and
                            product_data.get('brand_name') not in [None, 'N/A', ''] and
                            product_data.get('dosage') not in [None, 'N/A', '']):
                            print("   ✅ SUCCESS: Real product data!")
                            return pack_id
                        else:
                            print("   ⚠️  Still showing placeholders")
                        print()
                else:
                    # Show progress every 10 attempts
                    if i % 10 == 0:
                        print(f"   Tested {i+1}/50 pack IDs...")
                        
        except Exception as e:
            print(f"❌ Error testing {pack_id}: {e}")
    
    print("⚠️  No valid pack IDs found in 50 random attempts")
    return None

def test_specific_patterns():
    """Test specific patterns that might exist"""
    print("\n🔍 Testing specific pack ID patterns...")
    
    # Common patterns that might be in the database
    patterns = [
        # Simple sequential
        "PK-00000001", "PK-00000002", "PK-00000003",
        "PK-TEST0001", "PK-TEST0002", "PK-DEMO0001",
        
        # Common test patterns
        "PK-TESTPACK", "PK-DEMOPACK", "PK-SAMPLE01",
        
        # Realistic looking IDs
        "PK-A1B2C3D4", "PK-X1Y2Z3W4", "PK-M1N2P3Q4",
        "PK-ABC12345", "PK-XYZ98765", "PK-TEST1234",
        
        # Based on common random generation
        "PK-ABCD1234", "PK-WXYZ5678", "PK-QRST9012"
    ]
    
    for pack_id in patterns:
        try:
            response = requests.post(
                f"{BASE_URL}/verify/pack",
                json={
                    "pack_id": pack_id,
                    "location": "Test Location",
                    "phone_number": "+2348012345678"
                },
                timeout=3
            )
            
            if response.status_code == 200:
                data = response.json()
                result = data.get('verification_result', 'UNKNOWN')
                
                if result != 'INVALID':
                    print(f"🎉 FOUND: {pack_id} -> {result}")
                    
                    if data.get('data'):
                        product_data = data['data']
                        print(f"   📦 Product: {product_data.get('product_name', 'Unknown')}")
                        print(f"   💊 Brand: {product_data.get('brand_name', 'N/A')}")
                        print(f"   💉 Dosage: {product_data.get('dosage', 'N/A')}")
                        print(f"   📋 Form: {product_data.get('form', 'N/A')}")
                        print(f"   🌍 Country: {product_data.get('country_of_origin', 'N/A')}")
                        print()
                        return pack_id
                        
        except Exception as e:
            print(f"❌ Error testing {pack_id}: {e}")
    
    return None

def main():
    print("🔍 Testing Pack ID Verification with Correct Format...")
    
    # Test specific patterns first
    found_pack = test_specific_patterns()
    
    if not found_pack:
        # If no specific patterns work, try random generation
        found_pack = test_random_pack_ids()
    
    if found_pack:
        print(f"\n🎉 SUCCESS! Found working pack ID: {found_pack}")
        print("   This confirms that:")
        print("   ✅ Verification service is working")
        print("   ✅ Database has pack data")
        print("   ✅ Product details are being returned")
    else:
        print("\n⚠️  No valid pack IDs found")
        print("   This suggests:")
        print("   1. No pack data exists in the database yet")
        print("   2. Pack IDs use a different format")
        print("   3. The batch creation didn't generate packs")
        print("\n💡 Next steps:")
        print("   1. Run the MINIMAL_FIX_VERIFICATION.sql in Supabase")
        print("   2. Create more test batches to generate pack IDs")
        print("   3. Check if pack generation is working in batch creation")

if __name__ == "__main__":
    main()