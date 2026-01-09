from fastapi import APIRouter, Depends, BackgroundTasks, Request
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.verification import VerificationRequest, VerificationResponse, CartonVerificationRequest
from app.services.verification_service import VerificationService

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
    db: Session = Depends(get_db)
):
    """
    Verify a carton for supply chain tracking with role-based authorization
    Only registered distributors and pharmacies can verify carton codes
    """
    client_ip = fastapi_req.client.host
    
    result = VerificationService.verify_carton_with_authorization(
        db=db,
        carton_id=request.carton_id,
        ip_address=client_ip,
        location=getattr(request, 'location', None),
        phone_number=getattr(request, 'phone_number', None)
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
