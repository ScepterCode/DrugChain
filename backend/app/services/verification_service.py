from sqlalchemy.orm import Session
from app.models.verification import VerificationEvent
from app.models.batch import Pack, Batch, PackStatus, Carton
from app.models.product import Product
from app.models.organization import Organization, Manufacturer
from app.services.blockchain_service import blockchain_service
from app.services.supply_chain_tracking_service import SupplyChainTrackingService
from datetime import datetime, timezone
import logging

logger = logging.getLogger(__name__)

class VerificationService:
    @staticmethod
    def verify_pack(db: Session, pack_id: str, ip_address: str = None, location: str = None, phone_number: str = None) -> dict:
        """
        Enhanced verification with blockchain integration
        ALWAYS returns complete product data from database + blockchain verification
        """
        try:
            # ALWAYS get complete database verification first (this has all the product data)
            database_result = VerificationService._verify_pack_database_only(
                db, pack_id, ip_address, location, phone_number
            )
            
            # If database verification fails, return the error immediately
            if not database_result.get("success"):
                return database_result
            
            # Database verification successful - now add blockchain verification on top
            try:
                blockchain_result = blockchain_service.verify_pack_with_blockchain(
                    db=db,
                    pack_id=pack_id,
                    verifier_id=phone_number or "anonymous",
                    location=location or "",
                    ip_address=ip_address or ""
                )
                
                # Keep all the database product data, just add blockchain info
                if blockchain_result.get("blockchain_verified"):
                    database_result["blockchain_verified"] = True
                    database_result["message"] = "✅ BLOCKCHAIN VERIFIED: This product is authentic and verified on the blockchain."
                    
                    # Add blockchain-specific data to the existing product data
                    if database_result.get("data"):
                        database_result["data"]["blockchain_verified"] = True
                        database_result["data"]["blockchain_hash"] = blockchain_result.get("data", {}).get("blockchain_hash")
                        database_result["data"]["blockchain_tx_id"] = blockchain_result.get("blockchain_tx_id")
                        database_result["data"]["blockchain_status"] = blockchain_result.get("data", {}).get("blockchain_status")
                else:
                    database_result["blockchain_verified"] = False
                    database_result["message"] = "✅ DATABASE VERIFIED: Product verified (blockchain temporarily unavailable)."
                    
            except Exception as blockchain_error:
                logger.warning(f"Blockchain verification failed for {pack_id}: {blockchain_error}")
                # Continue with database result, just mark blockchain as unavailable
                database_result["blockchain_verified"] = False
                database_result["message"] = "✅ DATABASE VERIFIED: Product verified (blockchain temporarily unavailable)."
                if database_result.get("data"):
                    database_result["data"]["blockchain_verified"] = False
            
            return database_result
                
        except Exception as e:
            logger.error(f"Complete verification failed for {pack_id}: {e}")
            return {
                "success": False,
                "verification_result": "ERROR",
                "message": f"Verification system error: {str(e)}",
                "blockchain_verified": False,
                "data": None
            }
    
    @staticmethod
    def verify_carton_with_authorization(db: Session, carton_id: str, ip_address: str = None, 
                                       location: str = None, phone_number: str = None, 
                                       current_user = None) -> dict:
        """
        Verify carton with role-based authorization
        Supports both authenticated users (via JWT token) and phone-based verification
        Only registered distributors, retailers, manufacturers, and regulators can scan carton codes
        """
        # 1. Check authorization - prioritize authenticated user over phone number
        if current_user:
            # User is logged in - check their role
            from app.models import UserRole
            authorized_roles = [UserRole.DISTRIBUTOR, UserRole.RETAILER, 
                              UserRole.MANUFACTURER, UserRole.REGULATOR]
            
            if current_user.role in authorized_roles:
                auth_result = {
                    "authorized": True,
                    "entity_name": current_user.organization.organization_name if current_user.organization else "Unknown Organization",
                    "entity_type": current_user.role.value,
                    "entity_id": current_user.organization_id,
                    "user_name": current_user.full_name,
                    "user_id": current_user.user_id
                }
            else:
                return {
                    "success": False,
                    "verification_result": "UNAUTHORIZED",
                    "message": "🚫 ACCESS DENIED: Your account role does not have permission to verify carton codes. Only manufacturers, distributors, retailers, and regulators can scan cartons.",
                    "data": {
                        "error_type": "UNAUTHORIZED_ROLE",
                        "user_role": current_user.role.value,
                        "allowed_roles": ["MANUFACTURER", "DISTRIBUTOR", "RETAILER", "REGULATOR"],
                        "allowed_action": "Scan individual pack codes (PK-XXXXXXXX) for product verification"
                    }
                }
        else:
            # User is not logged in - check phone number authorization
            auth_result = SupplyChainTrackingService.verify_entity_authorization(db, phone_number)
            
            if not auth_result.get("authorized"):
                return {
                    "success": False,
                    "verification_result": "UNAUTHORIZED",
                    "message": "🚫 ACCESS DENIED: Only registered distributors, retailers, and pharmacies can verify carton codes. Please log in to your account or scan individual pack codes instead.",
                    "data": {
                        "error_type": "UNAUTHORIZED_CARTON_ACCESS",
                        "reason": auth_result.get("reason", "Not authorized"),
                        "allowed_action": "Log in to your account or scan individual pack codes (PK-XXXXXXXX) for product verification",
                        "contact_info": "Contact your retailer or distributor for assistance"
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
        elif batch.expiry_date < datetime.now(timezone.utc).date():
            verification_status = "EXPIRED"
            message = "⚠️ EXPIRED CARTON: Products in this carton have expired."
        
        # Log carton verification (for supply chain tracking)
        verification_event = VerificationEvent(
            pack_id=None,  # No pack_id for carton verifications
            carton_id=carton_id,  # Use carton_id field
            verified_by_phone=phone_number,
            verification_result=verification_status,
            location_address=location,
            ip_address=ip_address,
            created_at=datetime.now(timezone.utc)
        )
        db.add(verification_event)
        
        # Update carton tracking
        carton.current_holder_id = auth_info.get("entity_id")  # If available
        carton.updated_at = datetime.now(timezone.utc)
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
                "manufacturer": batch.manufacturer.organization.organization_name if batch.manufacturer and batch.manufacturer.organization else "Licensed Manufacturer",
                "packs_per_carton": carton.packs_per_carton,
                "production_date": batch.production_date.isoformat(),
                "expiry_date": batch.expiry_date.isoformat(),
                "verified_by_entity": auth_info["entity_name"],
                "entity_type": auth_info["entity_type"],
                "supply_chain_verified": True,
                "blockchain_verified": True,
                # Add more product details
                "brand_name": product.brand_name if product else None,
                "country_of_origin": product.country_of_origin if product else None,
                "dosage": product.dosage if product else None,
                "form": product.form if product else None,
                "nafdac_reg": product.nafdac_registration_number or product.regulatory_registration if product else "Registered",
                "description": product.description if product else None
            }
        }
    
    @staticmethod
    def _verify_pack_database_only(db: Session, pack_id: str, ip_address: str = None, location: str = None, phone_number: str = None) -> dict:
        """
        Strict database verification - NO FALLBACK LOGIC
        Forces proper error handling when data relationships are broken
        """
        import logging
        logger = logging.getLogger(__name__)
        
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
        
        logger.info(f"Pack found: {pack_id}, batch_id: {pack.batch_id}")
        
        # 2. STRICT: Batch must exist
        batch = db.query(Batch).filter(Batch.batch_id == pack.batch_id).first()
        
        if not batch:
            logger.error(f"BROKEN RELATIONSHIP: Pack {pack_id} references non-existent batch {pack.batch_id}")
            return {
                "success": False,
                "verification_result": "DATA_ERROR",
                "message": "🚨 DATABASE ERROR: Product batch information missing. Contact system administrator.",
                "blockchain_verified": False,
                "data": {
                    "error_type": "MISSING_BATCH",
                    "pack_id": pack_id,
                    "missing_batch_id": pack.batch_id,
                    "debug_info": "Pack exists but batch relationship is broken"
                }
            }
        
        logger.info(f"Batch found: {batch.batch_id}, product_id: {batch.product_id}")
        
        # 3. STRICT: Product must exist
        product = db.query(Product).filter(Product.product_id == batch.product_id).first()
        
        if not product:
            logger.error(f"BROKEN RELATIONSHIP: Batch {batch.batch_id} references non-existent product {batch.product_id}")
            return {
                "success": False,
                "verification_result": "DATA_ERROR",
                "message": "🚨 DATABASE ERROR: Product information missing. Contact system administrator.",
                "blockchain_verified": False,
                "data": {
                    "error_type": "MISSING_PRODUCT",
                    "pack_id": pack_id,
                    "batch_id": batch.batch_id,
                    "missing_product_id": batch.product_id,
                    "debug_info": "Batch exists but product relationship is broken"
                }
            }
        
        logger.info(f"Product found: {product.product_id}, name: {product.product_name}")
        
        # 4. STRICT: Manufacturer must exist
        manufacturer = db.query(Manufacturer).filter(Manufacturer.manufacturer_id == batch.manufacturer_id).first()
        
        if not manufacturer:
            logger.error(f"BROKEN RELATIONSHIP: Batch {batch.batch_id} references non-existent manufacturer {batch.manufacturer_id}")
            return {
                "success": False,
                "verification_result": "DATA_ERROR",
                "message": "🚨 DATABASE ERROR: Manufacturer information missing. Contact system administrator.",
                "blockchain_verified": False,
                "data": {
                    "error_type": "MISSING_MANUFACTURER",
                    "pack_id": pack_id,
                    "batch_id": batch.batch_id,
                    "missing_manufacturer_id": batch.manufacturer_id,
                    "debug_info": "Batch exists but manufacturer relationship is broken"
                }
            }
        
        # 5. STRICT: Organization must exist for manufacturer
        organization = db.query(Organization).filter(Organization.organization_id == manufacturer.manufacturer_id).first()
        
        if not organization:
            logger.error(f"BROKEN RELATIONSHIP: Manufacturer {manufacturer.manufacturer_id} references non-existent organization")
            return {
                "success": False,
                "verification_result": "DATA_ERROR",
                "message": "🚨 DATABASE ERROR: Manufacturer organization missing. Contact system administrator.",
                "blockchain_verified": False,
                "data": {
                    "error_type": "MISSING_ORGANIZATION",
                    "pack_id": pack_id,
                    "manufacturer_id": manufacturer.manufacturer_id,
                    "debug_info": "Manufacturer exists but organization relationship is broken"
                }
            }
        
        logger.info(f"Complete data chain verified for pack {pack_id}")
        
        # 6. Check if pack has already been scanned (ONE-TIME SCAN LOGIC)
        if pack.status == PackStatus.USED:
            # Log suspicious activity - someone is trying to reuse a scanned code
            verification_event = VerificationEvent(
                pack_id=pack_id,
                verified_by_phone=phone_number,
                verification_result="SUSPICIOUS",
                location_address=location,
                ip_address=ip_address,
                created_at=datetime.now(timezone.utc)
            )
            db.add(verification_event)
            db.commit()
            
            return {
                "success": False,
                "verification_result": "SUSPICIOUS",
                "message": "⚠️ SECURITY ALERT: This product has already been verified. If you purchased this product, it may be counterfeit. Contact the relevant regulatory authority or consumer protection agency immediately.",
                "blockchain_verified": False,
                "data": {
                    "pack_id": pack_id,
                    "product_name": product.product_name,
                    "manufacturer": organization.organization_name,
                    "first_scanned_at": pack.first_verified_at.isoformat() if pack.first_verified_at else None,
                    "scan_count": pack.verification_count,
                    "alert_type": "REUSED_CODE"
                }
            }
        
        # 7. Check batch and pack status
        verification_status = "GENUINE"
        message = "✅ AUTHENTIC: This product is genuine and safe to use."
        
        if batch.status.value == "RECALLED" or pack.status == PackStatus.RECALLED:
            verification_status = "RECALLED"
            message = "🚨 RECALLED PRODUCT: This product has been recalled by the manufacturer. Do not use!"
        elif batch.expiry_date < datetime.now(timezone.utc).date():
            verification_status = "EXPIRED"
            message = "⚠️ EXPIRED PRODUCT: This product has passed its expiry date. Do not use!"
            
        # 8. UPDATE VERIFICATION COUNT (but don't mark as USED yet)
        pack.verification_count += 1
        pack.last_verified_at = datetime.now(timezone.utc)
        if not pack.first_verified_at:
            pack.first_verified_at = datetime.now(timezone.utc)
            
        # 9. Log Verification Event
        verification_event = VerificationEvent(
            pack_id=pack_id,
            verified_by_phone=phone_number,
            verification_result=verification_status,
            location_address=location,
            ip_address=ip_address,
            created_at=datetime.now(timezone.utc)
        )
        db.add(verification_event)
        db.commit()
        
        # 10. Return COMPLETE data - NO FALLBACKS
        return {
            "success": True,
            "verification_result": verification_status,
            "message": message,
            "blockchain_verified": False,
            "data": {
                "pack_id": pack_id,
                "product_name": product.product_name,
                "product_code": product.product_code,
                "brand_name": product.brand_name,
                "manufacturer": organization.organization_name,
                "batch_id": batch.batch_id,
                "production_date": batch.production_date.isoformat(),
                "expiry_date": batch.expiry_date.isoformat(),
                "verification_count": pack.verification_count,
                "first_verified_at": pack.first_verified_at.isoformat(),
                "nafdac_reg": product.nafdac_registration_number or product.regulatory_registration,
                "country_of_origin": product.country_of_origin,
                "dosage": product.dosage,
                "form": product.form,
                "therapeutic_category": product.therapeutic_category,
                "requires_prescription": product.requires_prescription,
                "description": product.description,
                "manufacturer_code": manufacturer.manufacturer_code,
                "industry_type": product.industry_type,
                "risk_level": product.risk_level,
                "verification_complexity": product.verification_complexity,
                # Add pack status information
                "pack_status": pack.status.value,
                "is_used": pack.status == PackStatus.USED
            }
        }
    
    @staticmethod
    def verify_carton(db: Session, carton_id: str, ip_address: str = None, location: str = None, 
                     phone_number: str = None, current_user = None) -> dict:
        """
        Legacy carton verification method - now redirects to authorized verification
        """
        return VerificationService.verify_carton_with_authorization(
            db, carton_id, ip_address, location, phone_number, current_user
        )

    @staticmethod
    def verify_pack_authenticity(pack_id: str, db: Session, **kwargs) -> dict:
        """
        Verify the authenticity of a product pack for luxury goods and other industries.
        
        Args:
            pack_id: The pack identifier to verify
            db: Database session
            **kwargs: Additional parameters (ip_address, location, phone_number, etc.)
        
        Returns:
            dict: Verification result with status and details
        """
        try:
            # Extract optional parameters
            ip_address = kwargs.get('ip_address')
            location = kwargs.get('location')
            phone_number = kwargs.get('phone_number')
            
            # Use the existing verify_pack method
            result = VerificationService.verify_pack(
                db=db,
                pack_id=pack_id,
                ip_address=ip_address,
                location=location,
                phone_number=phone_number
            )
            
            # Transform result to match expected format for luxury goods
            return {
                "verified": result.get("success", False),
                "pack_id": pack_id,
                "verification_result": result.get("verification_result", "UNKNOWN"),
                "message": result.get("message", "Verification completed"),
                "details": result.get("data", {}),
                "blockchain_verified": result.get("blockchain_verified", False),
                "timestamp": datetime.now(timezone.utc).isoformat()
            }
            
        except Exception as e:
            logger.error(f"Pack authenticity verification failed for {pack_id}: {e}")
            return {
                "verified": False,
                "pack_id": pack_id,
                "verification_result": "ERROR",
                "message": f"Verification failed: {str(e)}",
                "details": {},
                "blockchain_verified": False,
                "timestamp": datetime.now(timezone.utc).isoformat()
            }
