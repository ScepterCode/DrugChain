#!/usr/bin/env python3
"""
Create test data through the API to test verification
"""
import requests
import json
import uuid
from datetime import datetime, timedelta

BASE_URL = "https://drugchain-1.onrender.com/api/v1"

def register_test_user():
    """Register a test manufacturer user"""
    print("=== Registering Test Manufacturer ===")
    
    email = f"test-manufacturer-{uuid.uuid4().hex[:8]}@example.com"
    user_data = {
        "email": email,
        "password": "TestPassword123!",
        "full_name": "Test Manufacturer",
        "phone_number": f"+234801{uuid.uuid4().hex[:7]}",
        "role": "MANUFACTURER",
        "organization_name": "Test Pharmaceutical Ltd",
        "organization_type": "MANUFACTURER",
        "registration_number": f"MFG-{uuid.uuid4().hex[:8].upper()}",
        "address": "123 Test Street, Lagos, Nigeria"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/auth/register", json=user_data, timeout=10)
        
        if response.status_code == 201:
            print("✅ User registered successfully")
            user_response = response.json()
            user_response["email"] = email  # Ensure email is in response
            print(f"   Email: {email}")
            return user_response
        else:
            print(f"❌ Registration failed: {response.status_code} - {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ Registration error: {e}")
        return None

def login_user(email, password):
    """Login and get access token"""
    print(f"=== Logging in as {email} ===")
    
    try:
        response = requests.post(
            f"{BASE_URL}/auth/login",
            data={"username": email, "password": password},
            headers={"Content-Type": "application/x-www-form-urlencoded"},
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Login successful")
            return data.get("access_token")
        else:
            print(f"❌ Login failed: {response.status_code} - {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ Login error: {e}")
        return None

def create_test_product(token):
    """Create a test product"""
    print("=== Creating Test Product ===")
    
    product_data = {
        "product_code": f"TEST-{uuid.uuid4().hex[:8].upper()}",
        "product_name": "Paracetamol 500mg Tablets",
        "description": "Pain relief and fever reducer tablets",
        "industry_type": "Healthcare",
        "dosage": "500mg",
        "form": "Tablet",
        "brand_name": "Panadol",
        "country_of_origin": "Nigeria",
        "nafdac_registration_number": f"NAFDAC-{uuid.uuid4().hex[:8].upper()}",
        "regulatory_registration": f"REG-{uuid.uuid4().hex[:8].upper()}",
        "active_ingredients": ["Paracetamol"],
        "therapeutic_category": "Analgesic",
        "requires_prescription": False
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/products",
            json=product_data,
            headers={"Authorization": f"Bearer {token}"},
            timeout=10
        )
        
        if response.status_code == 201:
            product = response.json()
            print(f"✅ Product created: {product.get('product_name')}")
            print(f"   Product ID: {product.get('product_id')}")
            return product
        else:
            print(f"❌ Product creation failed: {response.status_code} - {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ Product creation error: {e}")
        return None

def create_test_batch(token, product_id):
    """Create a test batch"""
    print("=== Creating Test Batch ===")
    
    batch_data = {
        "product_id": product_id,
        "batch_size": 1000,
        "production_date": datetime.now().strftime("%Y-%m-%d"),
        "expiry_date": (datetime.now() + timedelta(days=730)).strftime("%Y-%m-%d"),
        "number_of_cartons": 10,
        "packs_per_carton": 100,
        "quality_certificate_url": "https://example.com/cert.pdf"
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/ids/batch",
            json=batch_data,
            headers={"Authorization": f"Bearer {token}"},
            timeout=10
        )
        
        if response.status_code == 201:
            batch = response.json()
            print(f"✅ Batch created: {batch.get('batch_id')}")
            return batch
        else:
            print(f"❌ Batch creation failed: {response.status_code} - {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ Batch creation error: {e}")
        return None

def main():
    """Main function to create test data"""
    print("🧪 Creating Test Data for Verification...")
    
    # Step 1: Register test user
    user = register_test_user()
    if not user:
        print("❌ Failed to register user. Cannot continue.")
        return
    
    # Step 2: Login
    token = login_user(user.get("email"), "TestPassword123!")
    if not token:
        print("❌ Failed to login. Cannot continue.")
        return
    
    # Step 3: Create test product
    product = create_test_product(token)
    if not product:
        print("❌ Failed to create product. Cannot continue.")
        return
    
    # Step 4: Create test batch (this should generate pack IDs)
    batch = create_test_batch(token, product.get("product_id"))
    if not batch:
        print("❌ Failed to create batch.")
        return
    
    print("\n🎉 Test data created successfully!")
    print(f"📦 Product: {product.get('product_name')}")
    print(f"🏭 Batch: {batch.get('batch_id')}")
    
    # The batch creation should have generated pack IDs
    # Let's try to find them by testing some common patterns
    print("\n🔍 Testing verification with generated data...")
    
    # Try some pack ID patterns based on the batch ID
    batch_id = batch.get('batch_id', '')
    test_pack_ids = [
        f"PK-{batch_id[:8]}",
        f"{batch_id}-P-001",
        f"{batch_id}-PACK-001"
    ]
    
    for pack_id in test_pack_ids:
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
                print(f"📱 Testing {pack_id}: {data.get('verification_result')}")
                
                if data.get('success') and data.get('data'):
                    print("🎉 SUCCESS! Found working pack ID with real data:")
                    product_data = data['data']
                    print(f"   Product: {product_data.get('product_name')}")
                    print(f"   Brand: {product_data.get('brand_name')}")
                    print(f"   Dosage: {product_data.get('dosage')}")
                    print(f"   Form: {product_data.get('form')}")
                    print(f"   Country: {product_data.get('country_of_origin')}")
                    break
                    
        except Exception as e:
            print(f"❌ Error testing {pack_id}: {e}")

if __name__ == "__main__":
    main()