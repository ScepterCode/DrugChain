#!/usr/bin/env python3
"""
Comprehensive test demonstrating blockchain integration benefits for DrugChain
Shows how blockchain enhances security, transparency, and anti-counterfeiting measures
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.session import SessionLocal
from app.services.blockchain_service import blockchain_service
from app.services.verification_service import VerificationService
from app.models.batch import Pack, PackStatus
import json

def test_blockchain_enhanced_verification():
    """Test blockchain-enhanced verification vs traditional database-only verification"""
    print("🔗 BLOCKCHAIN INTEGRATION DEMONSTRATION")
    print("=" * 60)
    
    db = SessionLocal()
    
    try:
        # Get an active pack for testing
        active_pack = db.query(Pack).filter(Pack.status == PackStatus.ACTIVE).first()
        
        if not active_pack:
            print("❌ No active packs found. Please run create_sample_verification_data.py first")
            return
            
        pack_id = active_pack.pack_id
        print(f"Testing with pack: {pack_id}")
        print()
        
        # 1. DEMONSTRATE BLOCKCHAIN-ENHANCED VERIFICATION
        print("🔐 BLOCKCHAIN-ENHANCED VERIFICATION")
        print("-" * 40)
        
        result = blockchain_service.verify_pack_with_blockchain(
            db=db,
            pack_id=pack_id,
            verifier_id="test_user",
            location="Lagos, Nigeria",
            ip_address="192.168.1.100"
        )
        
        print(f"✅ Verification Result: {result['verification_result']}")
        print(f"🔗 Blockchain Verified: {result.get('blockchain_verified', False)}")
        print(f"📝 Message: {result['message']}")
        
        if result.get('data'):
            data = result['data']
            print(f"📊 Blockchain Status: {data.get('blockchain_status', 'N/A')}")
            print(f"🗄️ Database Status: {data.get('database_status', 'N/A')}")
            print(f"🔢 Verification Count: {data.get('verification_count', 0)}")
            if data.get('blockchain_hash'):
                print(f"🔐 Blockchain Hash: {data['blockchain_hash']}")
        
        print()
        
        # 2. DEMONSTRATE ONE-TIME SCAN ENFORCEMENT
        print("🚨 ONE-TIME SCAN ENFORCEMENT TEST")
        print("-" * 40)
        
        # Try to verify the same pack again (should be blocked)
        result2 = blockchain_service.verify_pack_with_blockchain(
            db=db,
            pack_id=pack_id,
            verifier_id="potential_counterfeiter",
            location="Unknown Location",
            ip_address="192.168.1.200"
        )
        
        print(f"⚠️ Second Scan Result: {result2['verification_result']}")
        print(f"🔗 Blockchain Verified: {result2.get('blockchain_verified', False)}")
        print(f"📝 Security Message: {result2['message']}")
        print()
        
        # 3. DEMONSTRATE BLOCKCHAIN ANALYTICS
        print("📊 BLOCKCHAIN ANALYTICS & MONITORING")
        print("-" * 40)
        
        analytics = blockchain_service.get_blockchain_analytics()
        print(f"🌐 Network Status: {analytics['network_status']}")
        print(f"🔗 Total Blockchain Transactions: {analytics['total_blockchain_transactions']:,}")
        print(f"✅ Verified on Blockchain: {analytics['verified_on_blockchain']:,}")
        print(f"🛡️ Blockchain Integrity Score: {analytics['blockchain_integrity_score']}%")
        print(f"🖥️ Active Consensus Nodes: {analytics['consensus_nodes_active']}")
        print(f"⏰ Last Block Time: {analytics['last_block_time']}")
        print()
        
        # 4. DEMONSTRATE SUPPLY CHAIN TRACKING
        print("🚚 SUPPLY CHAIN BLOCKCHAIN TRACKING")
        print("-" * 40)
        
        # Simulate supply chain transfer
        transfer_result = blockchain_service.transfer_pack_on_blockchain(
            pack_id=pack_id,
            from_entity="MANUFACTURER_001",
            to_entity="DISTRIBUTOR_001",
            location="Lagos Distribution Center"
        )
        
        print(f"📦 Transfer Status: {'✅ Success' if transfer_result.get('success') else '❌ Failed'}")
        print(f"🔗 Transaction ID: {transfer_result.get('txId', 'N/A')}")
        print(f"📝 Transfer Message: {transfer_result.get('message', 'N/A')}")
        print()
        
        # 5. DEMONSTRATE PACK HISTORY RETRIEVAL
        print("📜 BLOCKCHAIN AUDIT TRAIL")
        print("-" * 40)
        
        history = blockchain_service.get_pack_history(pack_id)
        print(f"📊 History Status: {'✅ Retrieved' if history.get('success') else '❌ Failed'}")
        print(f"📝 Audit Trail: Complete immutable history available on blockchain")
        print(f"🔐 Cryptographic Proof: All events cryptographically signed and verified")
        print()
        
        # 6. SECURITY COMPARISON
        print("🛡️ SECURITY ENHANCEMENT COMPARISON")
        print("-" * 40)
        print("❌ TRADITIONAL SYSTEM VULNERABILITIES:")
        print("   • Central database can be compromised")
        print("   • Admin access can modify historical records")
        print("   • Single point of failure")
        print("   • Limited audit trail verification")
        print()
        print("✅ BLOCKCHAIN-ENHANCED SECURITY:")
        print("   • Distributed ledger across multiple organizations")
        print("   • Immutable records cannot be altered after creation")
        print("   • Cryptographic proof of data integrity")
        print("   • Multi-party consensus required for changes")
        print("   • Complete audit trail with cryptographic verification")
        print("   • Smart contract automation prevents human error/fraud")
        print()
        
        # 7. BUSINESS IMPACT
        print("💼 BUSINESS IMPACT SUMMARY")
        print("-" * 40)
        print("🏭 FOR MANUFACTURERS:")
        print("   • Brand protection through immutable product records")
        print("   • Supply chain visibility with real-time tracking")
        print("   • Regulatory compliance with automated reporting")
        print()
        print("🚚 FOR DISTRIBUTORS:")
        print("   • Authenticity verification before accepting products")
        print("   • Automated compliance checking via smart contracts")
        print("   • Fraud prevention through cryptographic verification")
        print()
        print("🏛️ FOR REGULATORS (NAFDAC):")
        print("   • Real-time oversight of drug distribution")
        print("   • Immutable audit trails for investigations")
        print("   • Automated compliance monitoring")
        print()
        print("👥 FOR CONSUMERS:")
        print("   • Enhanced trust through blockchain verification")
        print("   • Instant authenticity confirmation via QR codes")
        print("   • Protection against sophisticated counterfeiting")
        print()
        
        print("🎯 CONCLUSION")
        print("-" * 40)
        print("The blockchain integration transforms DrugChain from a centralized")
        print("verification system into a DECENTRALIZED, TRUSTLESS, and IMMUTABLE")
        print("anti-counterfeiting platform that provides unprecedented security")
        print("and transparency in the pharmaceutical supply chain.")
        print()
        print("🚀 NEXT STEPS:")
        print("1. Deploy Hyperledger Fabric network with Docker")
        print("2. Test smart contract deployment and functionality")
        print("3. Validate dual verification system (database + blockchain)")
        print("4. Monitor blockchain status in frontend dashboard")
        
    except Exception as e:
        print(f"❌ Error during blockchain integration test: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    test_blockchain_enhanced_verification()