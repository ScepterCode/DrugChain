from sqlalchemy.orm import Session
from app.models.verification import VerificationEvent
from app.models.batch import Pack, Batch, PackStatus, Carton
from app.services.blockchain_service import blockchain_service
from app.services.supply_chain_tracking_service import SupplyChainTrackingService
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

class VerificationService:
    @staticmethod
    def verify_pack(db: Session, pack_id: str, ip_address: str = None, location: str = None, phone_number: str = None) -> dict:
        """
        Enhanced verification with blockchain integration
        Provides dual-layer security: database + blockchain verification
        """
        try:
            # Use blockchain-enhanced verification
            blockchain_result = blockchain_service.verify_pack_with_blockchain(
                db=db,
                pack_id=pack_id,
                verifier_id=phone_number or "anonymous",
                location=location or "",
                ip_address=ip_address or ""
            )
            
            if blockchain_result.get("blockchain_verified"):
                # Blockchain verification successful - use blockchain result
                return blockchain_result
            else:
                # Fallback to traditional database verification
                return VerificationService._verify_pack_database_only(
                    db, pack_id, ip_address, location, phone_number
                )
                
        except Exception as e:
            logger.error(f"Blockchain verification failed for {pack_id}: {e}")
            # Fallback to database-only verification
            return VerificationService._verify_pack_database_only(
                db, pack_id, ip_address, location, phone_number
            )
    
    @staticmethod
    def verify_carton_with_authorization(db: Session, carton_id: str, ip_address: str = None, 
                                       location: str = None, phone_number: str = None) -> dict:
        """
        Verify carton with role-based authorization
        Only registered distributors and pharmacies can scan carton codes
        """
        # 1. Check authorization first
        auth_result = SupplyChainTrackingService.verify_entity_authorization(db, phone_number)
        
        if not auth_result.get("authorized"):
            return {
                "success": False,
                "verification_result": "UNAUTHORIZED",
                "message": "🚫 ACCESS DENIED: Only registered distributors and pharmacies can verify carton codes. As an end user, please scan individual pack codes instead.",
                "data": {
                    "error_type": "UNAUTHORIZED_CARTON_ACCESS",
                    "reason": auth_result.get("reason", "Not authorized"),
                    "allowed_action": "Scan individual pack codes (PK-XXXXXXXX) for product verification",
                    "contact_info": "Contact your pharmacy or distributor for assistance"
                }
            }
        
        # 2. Proceed with carton verification for authorized entities
        return VerificationService._verify_carton_authorized(
            db, carton_id, ip_address, location, phone_number, auth_result
        )
    
    @staticmethod
    def _verify_carton_authorized(db: Session, carton_id: str, ip_address: str, 
                                location: str, phone_number: str, auth_info: dict) -> dict:
        """
        Verify carton for authorized entities (internal method)
        """
        # Look up Carton
        carton = db.query(Carton).filter(Carton.carton_id == carton_id).first()
        
        if not carton:
            return {
                "success": False,
                "verification_result": "INVALID",
                "message": "⚠️ INVALID CARTON: This carton code is not recognized.",
                "data": None
            }
        
        # Get batch and product info
        batch = carton.batch
        if not batch:
            return {
                "success": False,
                "verification_result": "INVALID",
                "message": "⚠️ INVALID CARTON: Carton data corrupted.",
                "data": None
            }
            
        product = batch.product
        
        # Check if carton is in valid state for scanning
        verification_status = "GENUINE"
        message = f"✅ SUPPLY CHAIN VERIFIED: Authentic carton verified for {auth_info['entity_name']}"
        
        if batch.status.value == "RECALLED":
            verification_status = "RECALLED"
            message = "🚨 RECALLED CARTON: This carton contains recalled products. Do not distribute!"
        elif batch.expiry_date < datetime.utcnow().date():
            verification_status = "EXPIRED"
            message = "⚠️ EXPIRED CARTON: Products in this carton have expired."
        
        # Log carton verification (for supply chain tracking)
        verification_event = VerificationEvent(
            pack_id=f"CARTON-{carton_id}",  # Use special format for carton verifications
            verified_by_phone=phone_number,
            verification_result=verification_status,
            location_address=location,
            ip_address=ip_address,
            created_at=datetime.utcnow()
        )
        db.add(verification_event)
        
        # Update carton tracking
        carton.current_holder_id = auth_info.get("entity_id")  # If available
        carton.updated_at = datetime.utcnow()
        db.commit()
        
        # Log blockchain supply chain event
        try:
            blockchain_service.transfer_carton_on_blockchain(
                carton_id=carton_id,
                from_entity="PREVIOUS_HOLDER",
                to_entity=auth_info["entity_name"],
                location=location or "Unknown Location"
            )
        except Exception as e:
            logger.warning(f"Blockchain logging failed: {e}")
        
        return {
            "success": True,
            "verification_result": verification_status,
            "message": message,
            "data": {
                "carton_id": carton_id,
                "batch_id": batch.batch_id,
                "product_name": product.product_name if product else "Unknown Product",
                "product_code": product.product_code if product else "Unknown",
                "packs_per_carton": carton.packs_per_carton,
                "production_date": batch.production_date.isoformat(),
                "expiry_date": batch.expiry_date.isoformat(),
                "verified_by_entity": auth_info["entity_name"],
                "entity_type": auth_info["entity_type"],
                "supply_chain_verified": True,
                "blockchain_verified": True
            }
        }
    
    @staticmethod
    def _verify_pack_database_only(db: Session, pack_id: str, ip_address: str = None, location: str = None, phone_number: str = None) -> dict:
        """
        Original database-only verification (fallback method)
        Each pack can only be scanned once to prevent counterfeiting.
        """
        # 1. Look up Pack
        pack = db.query(Pack).filter(Pack.pack_id == pack_id).first()
        
        if not pack:
            return {
                "success": False,
                "verification_result": "INVALID",
                "message": "⚠️ COUNTERFEIT ALERT: This code is not recognized. This product may be counterfeit.",
                "blockchain_verified": False,
                "data": None
            }
        
        # 2. Check if pack has already been scanned (ONE-TIME SCAN LOGIC)
        if pack.status == PackStatus.USED:
            # Log suspicious activity - someone is trying to reuse a scanned code
            verification_event = VerificationEvent(
                pack_id=pack_id,
                verified_by_phone=phone_number,
                verification_result="SUSPICIOUS",
                location_address=location,
                ip_address=ip_address,
                created_at=datetime.utcnow()
            )
            db.add(verification_event)
            db.commit()
            
            return {
                "success": False,
                "verification_result": "SUSPICIOUS",
                "message": "⚠️ SECURITY ALERT: This product has already been verified. If you purchased this product, it may be counterfeit. Contact NAFDAC immediately.",
                "blockchain_verified": False,
                "data": {
                    "pack_id": pack_id,
                    "first_scanned_at": pack.first_verified_at.isoformat() if pack.first_verified_at else None,
                    "scan_count": pack.verification_count,
                    "alert_type": "REUSED_CODE"
                }
            }
            
        # 3. Get Product Info via Batch
        batch = pack.batch
        if not batch:
            return {
                "success": False,
                "verification_result": "INVALID",
                "message": "⚠️ COUNTERFEIT ALERT: Product data corrupted. This may be counterfeit.",
                "blockchain_verified": False,
                "data": None
            }
            
        product = batch.product
        
        # 4. Check batch and pack status
        verification_status = "GENUINE"
        message = "✅ AUTHENTIC: This product is genuine and safe to use."
        
        if batch.status.value == "RECALLED" or pack.status == PackStatus.RECALLED:
            verification_status = "RECALLED"
            message = "🚨 RECALLED PRODUCT: This product has been recalled by the manufacturer. Do not use!"
        elif batch.expiry_date < datetime.utcnow().date():
            verification_status = "EXPIRED"
            message = "⚠️ EXPIRED PRODUCT: This product has passed its expiry date. Do not use!"
            
        # 5. MARK PACK AS USED (One-time scan enforcement)
        pack.status = PackStatus.USED
        pack.verification_count += 1
        pack.last_verified_at = datetime.utcnow()
        if not pack.first_verified_at:
            pack.first_verified_at = datetime.utcnow()
            
        # 6. Log Verification Event
        verification_event = VerificationEvent(
            pack_id=pack_id,
            verified_by_phone=phone_number,
            verification_result=verification_status,
            location_address=location,
            ip_address=ip_address,
            created_at=datetime.utcnow()
        )
        db.add(verification_event)
        db.commit()
        
        return {
            "success": True,
            "verification_result": verification_status,
            "message": message,
            "blockchain_verified": False,
            "data": {
                "pack_id": pack_id,
                "product_name": product.product_name if product else "Unknown Product",
                "product_code": product.product_code if product else "Unknown",
                "manufacturer": "Licensed Manufacturer",  # TODO: Get actual manufacturer name
                "batch_id": batch.batch_id,
                "production_date": batch.production_date.isoformat(),
                "expiry_date": batch.expiry_date.isoformat(),
                "verification_count": pack.verification_count,
                "first_verified_at": pack.first_verified_at.isoformat(),
                "nafdac_reg": product.nafdac_registration_number if product else None
            }
        }
    
    @staticmethod
    def verify_carton(db: Session, carton_id: str, ip_address: str = None, location: str = None, phone_number: str = None) -> dict:
        """
        Legacy carton verification method - now redirects to authorized verification
        """
        return VerificationService.verify_carton_with_authorization(
            db, carton_id, ip_address, location, phone_number
        )
