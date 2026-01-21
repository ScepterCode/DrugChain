from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List, Optional
import io
import zipfile
import csv
import qrcode
from PIL import Image

from app.db.session import get_db
from app.api.dependencies import get_current_user, require_role
from app.models import User, Batch, UserRole, Pack, Carton, Product
from app.schemas import BatchCreate, BatchResponse
from app.services.id_generation_service import IDGenerationService

router = APIRouter()


@router.post("/batch", response_model=BatchResponse, status_code=status.HTTP_201_CREATED)
async def create_batch(
    batch_data: BatchCreate,
    current_user: User = Depends(require_role([UserRole.MANUFACTURER.value])),
    db: Session = Depends(get_db)
):
    """Create a new batch and generate IDs (Manufacturer only)"""
    
    # Ensure user has an organization (Manufacturer)
    if not current_user.organization_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User is not associated with an organization"
        )

    try:
        new_batch = IDGenerationService.create_batch_hierarchy(
            db=db,
            batch_data=batch_data,
            manufacturer_id=current_user.organization_id,
            user_id=current_user.user_id
        )
        return new_batch
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        # In production, log the error and hide detail
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get("/batches")
async def list_batches(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List batches with enhanced information - optimized for performance"""
    
    # Use a single query with joins to avoid N+1 queries
    query = db.query(Batch, Product).join(Product, Batch.product_id == Product.product_id)
    
    if current_user.role == UserRole.MANUFACTURER:
        if not current_user.organization_id:
             return {"data": []}
        query = query.filter(Batch.manufacturer_id == current_user.organization_id)
    elif current_user.role not in [UserRole.SYSTEM_ADMIN, UserRole.REGULATOR]:
        return {"data": []}

    results = query.order_by(Batch.created_at.desc()).offset(skip).limit(limit).all()
    
    batch_list = []
    for batch, product in results:
        # Calculate packs per carton efficiently
        packs_per_carton = 0
        if batch.number_of_cartons and batch.number_of_cartons > 0:
            packs_per_carton = batch.batch_size // batch.number_of_cartons
        
        batch_dict = {
            "batch_id": batch.batch_id,
            "product_id": batch.product_id,
            "product_name": product.product_name,
            "production_date": batch.production_date.isoformat(),
            "expiry_date": batch.expiry_date.isoformat(),
            "batch_size": batch.batch_size,
            "packs_per_carton": packs_per_carton,
            "status": batch.status.value,
            "created_at": batch.created_at.isoformat(),
            "total_verifications": 0  # TODO: Calculate from verification logs if needed
        }
        batch_list.append(batch_dict)
    
    return {"data": batch_list}


@router.get("/batch/{batch_id}")
async def get_batch(
    batch_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get batch details with comprehensive information"""
    batch = db.query(Batch).filter(Batch.batch_id == batch_id).first()
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")
        
    # Check permissions
    if current_user.role == UserRole.MANUFACTURER:
        if batch.manufacturer_id != current_user.organization_id:
             raise HTTPException(status_code=403, detail="Not authorized to view this batch")
    
    # Get product info
    product = db.query(Product).filter(Product.product_id == batch.product_id).first()
    
    # Get cartons and packs for this batch
    cartons = db.query(Carton).filter(Carton.batch_id == batch_id).all()
    total_packs = db.query(Pack).filter(Pack.batch_id == batch_id).count()
    
    # Calculate packs per carton if we have the data
    packs_per_carton = 0
    if batch.number_of_cartons and batch.number_of_cartons > 0:
        packs_per_carton = batch.batch_size // batch.number_of_cartons
    
    return {
        "data": {
            "batch_id": batch.batch_id,
            "product_id": batch.product_id,
            "product_name": product.product_name if product else "Unknown",
            "product_code": product.product_code if product else "Unknown",
            "production_date": batch.production_date.isoformat(),
            "expiry_date": batch.expiry_date.isoformat(),
            "batch_size": batch.batch_size,
            "packs_per_carton": packs_per_carton,
            "status": batch.status.value,
            "created_at": batch.created_at.isoformat(),
            "total_cartons": len(cartons),
            "total_packs": total_packs,
            "cartons": [{"carton_id": c.carton_id, "pack_count": c.packs_per_carton} for c in cartons]
        }
    }


@router.get("/batch/{batch_id}/packs")
async def get_batch_packs(
    batch_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    limit: int = 100,
    offset: int = 0
):
    """Get all pack IDs for a specific batch"""
    # Verify batch exists and check permissions
    batch = db.query(Batch).filter(Batch.batch_id == batch_id).first()
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")
    
    if current_user.role == UserRole.MANUFACTURER:
        if batch.manufacturer_id != current_user.organization_id:
            raise HTTPException(status_code=403, detail="Not authorized to view this batch")
    
    packs = db.query(Pack).filter(Pack.batch_id == batch_id)\
        .offset(offset).limit(limit).all()
    
    total_count = db.query(Pack).filter(Pack.batch_id == batch_id).count()
    
    return {
        "data": {
            "packs": [{"pack_id": p.pack_id, "carton_id": p.carton_id, "status": p.status.value} for p in packs],
            "total_count": total_count,
            "limit": limit,
            "offset": offset
        }
    }


@router.get("/batch/{batch_id}/qr-codes")
async def download_qr_codes(
    batch_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Download QR codes for all packs in a batch as ZIP file"""
    # Verify batch exists and check permissions
    batch = db.query(Batch).filter(Batch.batch_id == batch_id).first()
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")
    
    if current_user.role == UserRole.MANUFACTURER:
        if batch.manufacturer_id != current_user.organization_id:
            raise HTTPException(status_code=403, detail="Not authorized to access this batch")
    
    # Get all packs for this batch
    packs = db.query(Pack).filter(Pack.batch_id == batch_id).all()
    
    if not packs:
        raise HTTPException(status_code=404, detail="No packs found for this batch")
    
    # Generate QR codes
    zip_buffer = io.BytesIO()
    
    with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
        # Add CSV file with pack IDs
        csv_content = "pack_id,carton_id,verification_url\n"
        for pack in packs:
            verification_url = f"https://drugchain.ng/verify?id={pack.pack_id}"
            csv_content += f"{pack.pack_id},{pack.carton_id},{verification_url}\n"
        
        zip_file.writestr(f"batch_{batch_id}_pack_ids.csv", csv_content)
        
        # Generate QR code images
        for pack in packs:
            # Create QR code
            qr = qrcode.QRCode(
                version=1,
                error_correction=qrcode.constants.ERROR_CORRECT_L,
                box_size=10,
                border=4,
            )
            verification_url = f"https://drugchain.ng/verify?id={pack.pack_id}"
            qr.add_data(verification_url)
            qr.make(fit=True)
            
            # Create QR code image
            qr_image = qr.make_image(fill_color="black", back_color="white")
            
            # Save to buffer
            img_buffer = io.BytesIO()
            qr_image.save(img_buffer, format='PNG')
            zip_file.writestr(f"qr_codes/{pack.pack_id}.png", img_buffer.getvalue())
    
    zip_buffer.seek(0)
    
    return StreamingResponse(
        io.BytesIO(zip_buffer.read()),
        media_type="application/zip",
        headers={"Content-Disposition": f"attachment; filename=batch_{batch_id}_qr_codes.zip"}
    )


@router.put("/batch/{batch_id}/status")
async def update_batch_status(
    batch_id: str,
    status_data: dict,
    current_user: User = Depends(require_role([UserRole.MANUFACTURER.value])),
    db: Session = Depends(get_db)
):
    """Update batch status"""
    batch = db.query(Batch).filter(Batch.batch_id == batch_id).first()
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")
    
    if batch.manufacturer_id != current_user.organization_id:
        raise HTTPException(status_code=403, detail="Not authorized to modify this batch")
    
    new_status = status_data.get("status")
    if new_status not in ["ACTIVE", "COMPLETED", "RECALLED"]:
        raise HTTPException(status_code=400, detail="Invalid status")
    
    batch.status = new_status
    db.commit()
    
    return {"success": True, "message": "Batch status updated successfully"}
