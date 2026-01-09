from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, func
from typing import Optional, List
from app.db.session import get_db
from app.api.dependencies import get_current_user, require_role
from app.models import User, UserRole, Product, Manufacturer, Batch, Pack, Organization
from app.models.verification import VerificationEvent

router = APIRouter()


@router.get("/products")
async def search_products(
    q: str = Query(..., description="Search query"),
    manufacturer_id: Optional[str] = None,
    category: Optional[str] = None,
    limit: int = 20,
    offset: int = 0,
    current_user: User = Depends(require_role([UserRole.REGULATOR.value, UserRole.SYSTEM_ADMIN.value])),
    db: Session = Depends(get_db)
):
    """Search products across all manufacturers (Regulator only)"""
    
    # Base query
    query = db.query(Product).join(Manufacturer, Product.manufacturer_id == Manufacturer.organization_id)
    
    # Apply search filters
    if q:
        search_filter = or_(
            Product.product_name.ilike(f"%{q}%"),
            Product.product_code.ilike(f"%{q}%"),
            Product.active_ingredients.contains([q]),
            Manufacturer.organization_name.ilike(f"%{q}%")
        )
        query = query.filter(search_filter)
    
    if manufacturer_id:
        query = query.filter(Product.manufacturer_id == manufacturer_id)
    
    if category:
        query = query.filter(Product.therapeutic_category.ilike(f"%{category}%"))
    
    # Get total count
    total_count = query.count()
    
    # Apply pagination
    products = query.offset(offset).limit(limit).all()
    
    # Format results
    results = []
    for product in products:
        manufacturer = db.query(Manufacturer).filter(
            Manufacturer.organization_id == product.manufacturer_id
        ).first()
        
        # Get batch count for this product
        batch_count = db.query(Batch).filter(Batch.product_id == product.product_id).count()
        
        results.append({
            "product_id": product.product_id,
            "product_name": product.product_name,
            "product_code": product.product_code,
            "manufacturer_name": manufacturer.organization_name if manufacturer else "Unknown",
            "manufacturer_id": product.manufacturer_id,
            "dosage": product.dosage,
            "form": product.form,
            "therapeutic_category": product.therapeutic_category,
            "active_ingredients": product.active_ingredients,
            "nafdac_registration_number": product.nafdac_registration_number,
            "batch_count": batch_count,
            "created_at": product.created_at.isoformat()
        })
    
    return {
        "data": {
            "products": results,
            "total_count": total_count,
            "limit": limit,
            "offset": offset
        }
    }


@router.get("/manufacturers")
async def search_manufacturers(
    q: Optional[str] = None,
    license_status: Optional[str] = None,
    limit: int = 20,
    offset: int = 0,
    current_user: User = Depends(require_role([UserRole.REGULATOR.value, UserRole.SYSTEM_ADMIN.value])),
    db: Session = Depends(get_db)
):
    """Search manufacturers (Regulator only)"""
    
    # Base query
    query = db.query(Manufacturer).join(Organization, Manufacturer.organization_id == Organization.organization_id)
    
    # Apply search filters
    if q:
        search_filter = or_(
            Organization.organization_name.ilike(f"%{q}%"),
            Manufacturer.nafdac_license_number.ilike(f"%{q}%"),
            Organization.registration_number.ilike(f"%{q}%")
        )
        query = query.filter(search_filter)
    
    if license_status:
        query = query.filter(Manufacturer.license_status == license_status)
    
    # Get total count
    total_count = query.count()
    
    # Apply pagination
    manufacturers = query.offset(offset).limit(limit).all()
    
    # Format results
    results = []
    for manufacturer in manufacturers:
        organization = db.query(Organization).filter(
            Organization.organization_id == manufacturer.organization_id
        ).first()
        
        # Get product count for this manufacturer
        product_count = db.query(Product).filter(
            Product.manufacturer_id == manufacturer.organization_id
        ).count()
        
        # Get batch count
        batch_count = db.query(Batch).filter(
            Batch.manufacturer_id == manufacturer.organization_id
        ).count()
        
        results.append({
            "organization_id": manufacturer.organization_id,
            "organization_name": organization.organization_name if organization else "Unknown",
            "registration_number": organization.registration_number if organization else None,
            "nafdac_license_number": manufacturer.nafdac_license_number,
            "license_status": manufacturer.license_status.value,
            "license_expiry_date": manufacturer.license_expiry_date.isoformat() if manufacturer.license_expiry_date else None,
            "product_count": product_count,
            "batch_count": batch_count,
            "created_at": organization.created_at.isoformat() if organization else None
        })
    
    return {
        "data": {
            "manufacturers": results,
            "total_count": total_count,
            "limit": limit,
            "offset": offset
        }
    }


@router.get("/batches")
async def search_batches(
    q: Optional[str] = None,
    product_id: Optional[str] = None,
    manufacturer_id: Optional[str] = None,
    status: Optional[str] = None,
    limit: int = 20,
    offset: int = 0,
    current_user: User = Depends(require_role([UserRole.REGULATOR.value, UserRole.SYSTEM_ADMIN.value, UserRole.MANUFACTURER.value])),
    db: Session = Depends(get_db)
):
    """Search batches with filters"""
    
    # Base query
    query = db.query(Batch).join(Product, Batch.product_id == Product.product_id)
    
    # Manufacturers can only see their own batches
    if current_user.role == UserRole.MANUFACTURER:
        if not current_user.organization_id:
            return {"data": {"batches": [], "total_count": 0, "limit": limit, "offset": offset}}
        query = query.filter(Batch.manufacturer_id == current_user.organization_id)
    
    # Apply search filters
    if q:
        search_filter = or_(
            Batch.batch_id.ilike(f"%{q}%"),
            Product.product_name.ilike(f"%{q}%"),
            Product.product_code.ilike(f"%{q}%")
        )
        query = query.filter(search_filter)
    
    if product_id:
        query = query.filter(Batch.product_id == product_id)
    
    if manufacturer_id:
        query = query.filter(Batch.manufacturer_id == manufacturer_id)
    
    if status:
        query = query.filter(Batch.status == status)
    
    # Get total count
    total_count = query.count()
    
    # Apply pagination
    batches = query.offset(offset).limit(limit).all()
    
    # Format results
    results = []
    for batch in batches:
        product = db.query(Product).filter(Product.product_id == batch.product_id).first()
        manufacturer = db.query(Manufacturer).filter(
            Manufacturer.organization_id == batch.manufacturer_id
        ).first()
        
        # Get verification count for this batch
        verification_count = db.query(VerificationEvent)\
            .join(Pack, VerificationEvent.pack_id == Pack.pack_id)\
            .filter(Pack.batch_id == batch.batch_id)\
            .count()
        
        results.append({
            "batch_id": batch.batch_id,
            "product_id": batch.product_id,
            "product_name": product.product_name if product else "Unknown",
            "manufacturer_name": manufacturer.organization_name if manufacturer else "Unknown",
            "production_date": batch.production_date.isoformat(),
            "expiry_date": batch.expiry_date.isoformat(),
            "batch_size": batch.batch_size,
            "status": batch.status.value,
            "verification_count": verification_count,
            "created_at": batch.created_at.isoformat()
        })
    
    return {
        "data": {
            "batches": results,
            "total_count": total_count,
            "limit": limit,
            "offset": offset
        }
    }


@router.get("/packs")
async def search_packs(
    pack_id: Optional[str] = None,
    batch_id: Optional[str] = None,
    status: Optional[str] = None,
    limit: int = 20,
    offset: int = 0,
    current_user: User = Depends(require_role([UserRole.REGULATOR.value, UserRole.SYSTEM_ADMIN.value])),
    db: Session = Depends(get_db)
):
    """Search individual packs (Regulator only)"""
    
    # Base query
    query = db.query(Pack).join(Batch, Pack.batch_id == Batch.batch_id)\
        .join(Product, Batch.product_id == Product.product_id)
    
    # Apply filters
    if pack_id:
        query = query.filter(Pack.pack_id.ilike(f"%{pack_id}%"))
    
    if batch_id:
        query = query.filter(Pack.batch_id == batch_id)
    
    if status:
        query = query.filter(Pack.status == status)
    
    # Get total count
    total_count = query.count()
    
    # Apply pagination
    packs = query.offset(offset).limit(limit).all()
    
    # Format results
    results = []
    for pack in packs:
        batch = db.query(Batch).filter(Batch.batch_id == pack.batch_id).first()
        product = db.query(Product).filter(Product.product_id == batch.product_id).first() if batch else None
        
        # Get verification history for this pack
        verifications = db.query(VerificationEvent)\
            .filter(VerificationEvent.pack_id == pack.pack_id)\
            .order_by(VerificationEvent.created_at.desc())\
            .all()
        
        results.append({
            "pack_id": pack.pack_id,
            "batch_id": pack.batch_id,
            "carton_id": pack.carton_id,
            "product_name": product.product_name if product else "Unknown",
            "status": pack.status.value,
            "verification_count": len(verifications),
            "last_verification": verifications[0].created_at.isoformat() if verifications else None,
            "created_at": pack.created_at.isoformat()
        })
    
    return {
        "data": {
            "packs": results,
            "total_count": total_count,
            "limit": limit,
            "offset": offset
        }
    }