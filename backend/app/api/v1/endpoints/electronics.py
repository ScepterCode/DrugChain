from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID

from app.db.session import get_db
from app.models import Product, User, ElectronicsSpecification
from app.schemas.product_category import EnhancedProductCreate, EnhancedProductResponse
from app.schemas.product import ProductResponse  # Use regular schema instead
from app.api.dependencies import get_current_user, require_role

router = APIRouter()


@router.post("/compatibility-check")
async def check_electronics_compatibility(
    product_id: UUID,
    target_product_id: UUID,
    db: Session = Depends(get_db)
):
    """Check compatibility between electronic products"""
    try:
        product = db.query(Product).filter(Product.product_id == product_id).first()
        target = db.query(Product).filter(Product.product_id == target_product_id).first()
        
        if not product or not target:
            raise HTTPException(status_code=404, detail="Product not found")
        
        # For now, return a basic compatibility check
        # In a real implementation, this would check specifications
        compatibility_result = {
            "compatible": True,
            "compatibility_score": 85.0,
            "issues": [],
            "recommendations": ["Products appear to be compatible"]
        }
        
        return compatibility_result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{product_id}/warranty-status")
async def get_warranty_status(
    product_id: UUID,
    serial_number: str,
    db: Session = Depends(get_db)
):
    """Get warranty status for electronic product"""
    try:
        product = db.query(Product).filter(Product.product_id == product_id).first()
        
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        
        # For now, return a mock warranty status
        # In a real implementation, this would check warranty database
        warranty_status = {
            "product_id": str(product_id),
            "serial_number": serial_number,
            "warranty_status": "active",
            "warranty_start_date": "2024-01-01",
            "warranty_end_date": "2026-01-01",
            "coverage_type": "full",
            "remaining_days": 365
        }
        
        return warranty_status
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/products", response_model=ProductResponse)
async def create_electronics_product(
    product_data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["MANUFACTURER", "ELECTRONICS_MANUFACTURER"]))
):
    """Create electronics product with specifications"""
    try:
        # Create base product
        base_product = Product(
            product_code=product_data.get("product_code"),
            product_name=product_data.get("product_name"),
            description=product_data.get("description"),
            industry_type="Technology",
            brand_name=product_data.get("brand_name"),
            model_number=product_data.get("model_number"),
            country_of_origin=product_data.get("country_of_origin"),
            warranty_period_months=product_data.get("warranty_period_months"),
            manufacturer_id=current_user.organization_id
        )
        
        db.add(base_product)
        db.flush()
        
        # Create electronics specifications if provided
        if "electronics_spec" in product_data:
            spec_data = product_data["electronics_spec"]
            electronics_spec = ElectronicsSpecification(
                product_id=base_product.product_id,
                processor=spec_data.get("processor"),
                memory_gb=spec_data.get("memory_gb"),
                storage_gb=spec_data.get("storage_gb"),
                display_size=spec_data.get("display_size"),
                battery_capacity=spec_data.get("battery_capacity"),
                operating_system=spec_data.get("operating_system"),
                connectivity=spec_data.get("connectivity", {}),
                dimensions=spec_data.get("dimensions", {}),
                compatibility_matrix=spec_data.get("compatibility_matrix", {})
            )
            db.add(electronics_spec)
        
        db.commit()
        db.refresh(base_product)
        
        return ProductResponse.from_orm(base_product)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/recalls")
async def get_electronics_recalls(
    product_id: Optional[UUID] = None,
    model_number: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get electronics recall information"""
    try:
        # For now, return mock recall data
        # In a real implementation, this would check recall databases
        recalls = [
            {
                "recall_id": "ELEC-2024-001",
                "product_model": model_number or "Sample Model",
                "recall_date": "2024-01-15",
                "severity": "medium",
                "description": "Battery overheating issue",
                "action_required": "Contact manufacturer for battery replacement",
                "status": "active"
            }
        ]
        
        return recalls
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))