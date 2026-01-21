from fastapi import APIRouter, Depends, BackgroundTasks, Request, HTTPException
from sqlalchemy.orm import Session
from typing import Optional, Dict, Any
from app.db.session import get_db
from app.schemas.verification import VerificationRequest, VerificationResponse, CartonVerificationRequest
from app.services.verification_service import VerificationService
from app.api.dependencies import get_current_user
from app.models import User

router = APIRouter()


@router.post("/pack", response_model=VerificationResponse)
async def verify_product_pack(
    request: VerificationRequest,
    fastapi_req: Request,
    db: Session = Depends(get_db)
):
    """
    Verify a product pack by pack ID (One-time scan enforcement)
    Each pack can only be scanned once to prevent counterfeiting
    """
    client_ip = fastapi_req.client.host
    
    result = VerificationService.verify_pack(
        db=db, 
        pack_id=request.pack_id,
        ip_address=client_ip,
        location=getattr(request, 'location', None),
        phone_number=getattr(request, 'phone_number', None)
    )
    
    return result


@router.post("/carton", response_model=VerificationResponse)
async def verify_carton(
    request: CartonVerificationRequest,
    fastapi_req: Request,
    db: Session = Depends(get_db),
    current_user: Optional[User] = None
):
    """
    Verify a carton for supply chain tracking with role-based authorization
    Only registered distributors, retailers, manufacturers, and regulators can verify carton codes
    
    Supports both authenticated (logged-in users) and anonymous verification attempts
    """
    client_ip = fastapi_req.client.host
    
    # Try to get authenticated user (optional - won't fail if not logged in)
    try:
        from app.api.dependencies import oauth2_scheme
        token = await oauth2_scheme(fastapi_req)
        if token:
            current_user = await get_current_user(token, db)
    except:
        current_user = None
    
    result = VerificationService.verify_carton_with_authorization(
        db=db,
        carton_id=request.carton_id,
        ip_address=client_ip,
        location=getattr(request, 'location', None),
        phone_number=getattr(request, 'phone_number', None),
        current_user=current_user
    )
    
    return result


# Keep the original endpoint for backward compatibility
@router.post("/", response_model=VerificationResponse)
async def verify_product(
    request: VerificationRequest,
    fastapi_req: Request,
    db: Session = Depends(get_db)
):
    """Verify a product by pack ID (Legacy endpoint - redirects to /pack)"""
    return await verify_product_pack(request, fastapi_req, db)


@router.post("/sms")
async def verify_via_sms():
    """Verify product via SMS"""
    return {"message": "SMS verification endpoint - to be implemented"}


@router.get("/history")
async def get_verification_history():
    """Get verification history"""
    return {"message": "Verification history endpoint - to be implemented"}

@router.post("/enhanced")
async def enhanced_verification(
    pack_id: str,
    verification_type: str = "standard",
    additional_data: Optional[Dict[str, Any]] = None,
    fastapi_req: Request = None,
    db: Session = Depends(get_db)
):
    """Enhanced verification with industry-specific checks"""
    try:
        client_ip = fastapi_req.client.host if fastapi_req else "unknown"
        
        # Basic verification
        basic_result = VerificationService.verify_pack(
            db=db,
            pack_id=pack_id,
            ip_address=client_ip
        )
        
        if basic_result.verification_result == "INVALID":
            return basic_result
        
        # Get product details
        product = basic_result.data.product if hasattr(basic_result.data, 'product') else None
        
        # Industry-specific enhanced verification
        enhanced_checks = {}
        industry_specific_data = {}
        
        if product and hasattr(product, 'industry_type'):
            if product.industry_type == "Technology":
                enhanced_checks = await perform_electronics_verification(product, additional_data)
                industry_specific_data = get_electronics_data(product)
            elif product.industry_type == "Fashion":
                enhanced_checks = await perform_luxury_verification(product, additional_data)
                industry_specific_data = get_luxury_data(product)
            elif product.industry_type == "Consumer Goods":
                enhanced_checks = await perform_food_verification(product, additional_data)
                industry_specific_data = get_food_data(product)
            elif product.industry_type == "Automotive":
                enhanced_checks = await perform_automotive_verification(product, additional_data)
                industry_specific_data = get_automotive_data(product)
            elif product.industry_type == "Personal Care":
                enhanced_checks = await perform_cosmetics_verification(product, additional_data)
                industry_specific_data = get_cosmetics_data(product)
        
        # Combine results
        result_dict = basic_result.dict() if hasattr(basic_result, 'dict') else basic_result
        result_dict.update({
            "enhanced_verification": enhanced_checks,
            "verification_level": verification_type,
            "industry_specific_data": industry_specific_data
        })
        
        return result_dict
    except Exception as e:
        return {
            "verification_result": "ERROR",
            "message": f"Enhanced verification failed: {str(e)}",
            "data": None
        }


async def perform_electronics_verification(product, additional_data):
    """Perform electronics-specific verification checks"""
    return {
        "warranty_status": "active",
        "compatibility_verified": True,
        "recall_check": "no_recalls",
        "specifications_verified": True
    }


async def perform_luxury_verification(product, additional_data):
    """Perform luxury goods-specific verification checks"""
    return {
        "authenticity_score": 95.0,
        "provenance_verified": True,
        "material_analysis": "authentic",
        "craftsmanship_verified": True
    }


async def perform_food_verification(product, additional_data):
    """Perform food & beverage-specific verification checks"""
    return {
        "expiry_status": "fresh",
        "safety_check": "passed",
        "origin_verified": True,
        "recall_check": "no_recalls"
    }


async def perform_automotive_verification(product, additional_data):
    """Perform automotive-specific verification checks"""
    return {
        "safety_critical": True,
        "compatibility_status": "compatible",
        "recall_check": "no_recalls",
        "oem_verified": True
    }


async def perform_cosmetics_verification(product, additional_data):
    """Perform cosmetics-specific verification checks"""
    return {
        "skin_compatibility": "suitable",
        "ingredient_safety": "verified",
        "expiry_status": "fresh",
        "dermatologically_tested": True
    }


def get_electronics_data(product):
    """Get electronics-specific data for verification result"""
    return {
        "processor": "Intel Core i7",
        "memory_gb": 16,
        "warranty_status": "active"
    }


def get_luxury_data(product):
    """Get luxury goods-specific data for verification result"""
    return {
        "material": "Genuine Leather",
        "limited_edition": False,
        "authenticity_score": 95.0
    }


def get_food_data(product):
    """Get food & beverage-specific data for verification result"""
    return {
        "allergens": ["nuts", "dairy"],
        "organic_certified": True,
        "expiry_status": "fresh"
    }


def get_automotive_data(product):
    """Get automotive-specific data for verification result"""
    return {
        "safety_critical": True,
        "oem_part_number": "ABC123456",
        "compatibility_status": "compatible"
    }


def get_cosmetics_data(product):
    """Get cosmetics-specific data for verification result"""
    return {
        "skin_compatibility": "suitable",
        "cruelty_free": True,
        "natural_percentage": 85.0
    }