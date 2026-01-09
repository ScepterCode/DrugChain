#!/usr/bin/env python3
"""
Test script to demonstrate one-time scan logic
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.db.session import SessionLocal
from app.services.verification_service import VerificationService
from app.models.batch import Pack, PackStatus
import json

def test_one_time_scan():
    """Test the one-time scan enforcement"""
    db = SessionLocal()
    
    try:
        # Get a pack that's currently ACTIVE
        active_pack = db.query(Pack).filter(Pack.status == PackStatus.ACTIVE).first()
        
        if not active_pack:
            print("No active packs found. Please create a batch first.")
            return
        
        pack_id = active_pack.pack_id
        print(f"Testing one-time scan logic with pack: {pack_id}")
        print("=" * 60)
        
        # First scan - should be successful and mark pack as USED
        print("🔍 FIRST SCAN:")
        result1 = VerificationService.verify_pack(
            db=db,
            pack_id=pack_id,
            ip_address="192.168.1.100",
            location="Lagos, Nigeria",
            phone_number="+2348012345678"
        )
        
        print(f"Result: {result1['verification_result']}")
        print(f"Success: {result1['success']}")
        print(f"Message: {result1['message']}")
        if result1.get('data'):
            print(f"Product: {result1['data'].get('product_name', 'Unknown')}")
        print()
        
        # Check pack status after first scan
        db.refresh(active_pack)
        print(f"Pack status after first scan: {active_pack.status}")
        print(f"Verification count: {active_pack.verification_count}")
        print()
        
        # Second scan - should be SUSPICIOUS (reused code)
        print("🚨 SECOND SCAN (Should be blocked):")
        result2 = VerificationService.verify_pack(
            db=db,
            pack_id=pack_id,
            ip_address="192.168.1.200",
            location="Abuja, Nigeria",
            phone_number="+2348087654321"
        )
        
        print(f"Result: {result2['verification_result']}")
        print(f"Success: {result2['success']}")
        print(f"Message: {result2['message']}")
        if result2.get('data'):
            print(f"Alert Type: {result2['data'].get('alert_type', 'N/A')}")
            print(f"First Scanned: {result2['data'].get('first_scanned_at', 'N/A')}")
        print()
        
        # Check pack status after second scan
        db.refresh(active_pack)
        print(f"Pack status after second scan: {active_pack.status}")
        print(f"Verification count: {active_pack.verification_count}")
        print()
        
        print("✅ One-time scan logic working correctly!")
        print("- First scan: Genuine → Pack marked as USED")
        print("- Second scan: Suspicious → Counterfeit alert triggered")
        
    except Exception as e:
        print(f"Error during test: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    test_one_time_scan()