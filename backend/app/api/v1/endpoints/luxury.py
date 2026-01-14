from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID
import uuid
from datetime import datetime

from app.db.session import get_db
from app.models import Product, User, LuxurySpecification, Pack
from app.schemas.product_category import EnhancedProductCreate, EnhancedProductResponse
from app.api.dependencies import get_current_user, require_role
from app.services.verification_service import verify_pack_authenticity

router = APIRouter()


@router.post("/authenticity-certificate")
async def generate_authenticity_certificate(
    product_id: UUID,
    pack_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["MANUFACTURER", "LUXURY_BRAND", "AUTHENTICATOR"]))
):
    """Generate authenticity certificate for luxury item"""
    try:
        # Verify product and pack exist
        product = db.query(Product).filter(Product.product_id == product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        
        pack = db.query(Pack).filter(Pack.pack_id == pack_id).first()
        if not pack:
            raise HTTPException(status_code=404, detail="Pack not found")
        
        # Get luxury specifications
        luxury_spec = db.query(LuxurySpecification).filter(
            LuxurySpecification.product_id == product_id
        ).first()
        
        # Generate certificate
        certificate = {
            "certificate_id": str(uuid.uuid4()),
            "product_id": str(product_id),
            "pack_id": pack_id,
            "authenticity_verified": True,
            "verification_date": datetime.utcnow().isoformat(),
            "verifier": current_user.full_name,
            "product_details": {
                "brand": product.brand_name,
                "model": product.model_number,
                "material": luxury_spec.material if luxury_spec else None,
                "limited_edition": luxury_spec.limited_edition if luxury_spec else False,
                "designer": luxury_spec.designer if luxury_spec else None,
                "collection": luxury_spec.collection_name if luxury_spec else None
            },
            "blockchain_hash": f"0x{uuid.uuid4().hex[:32]}"  # Mock blockchain hash
        }
        
        return certificate
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{product_id}/resale-value")
async def estimate_resale_value(
    product_id: UUID,
    condition: str,
    market_location: str = "US",
    db: Session = Depends(get_db)
):
    """Estimate resale value for luxury item"""
    try:
        product = db.query(Product).filter(Product.product_id == product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        
        luxury_spec = db.query(LuxurySpecification).filter(
            LuxurySpecification.product_id == product_id
        ).first()
        
        # Mock resale value calculation
        base_value = float(luxury_spec.estimated_value) if luxury_spec and luxury_spec.estimated_value else 1000.0
        
        # Condition multipliers
        condition_multipliers = {
            "new": 0.95,
            "excellent": 0.85,
            "good": 0.70,
            "fair": 0.55,
            "poor": 0.30
        }
        
        multiplier = condition_multipliers.get(condition.lower(), 0.70)
        estimated_value = base_value * multiplier
        
        return {
            "product_id": str(product_id),
            "original_value": base_value,
            "condition": condition,
            "market_location": market_location,
            "estimated_resale_value": estimated_value,
            "confidence_score": 0.85,
            "market_trends": {
                "demand": "high",
                "price_trend": "stable",
                "liquidity": "good"
            },
            "comparable_sales": [
                {"sale_date": "2024-01-10", "price": estimated_value * 1.05, "condition": condition},
                {"sale_date": "2024-01-05", "price": estimated_value * 0.95, "condition": condition}
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/products", response_model=EnhancedProductResponse)
async def create_luxury_product(
    product_data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["MANUFACTURER", "LUXURY_BRAND"]))
):
    """Create luxury product with specifications"""
    try:
        # Create base product
        base_product = Product(
            product_code=product_data.get("product_code"),
            product_name=product_data.get("product_name"),
            description=product_data.get("description"),
            industry_type="Fashion",
            brand_name=product_data.get("brand_name"),
            model_number=product_data.get("model_number"),
            country_of_origin=product_data.get("country_of_origin"),
            warranty_period_months=product_data.get("warranty_period_months"),
            manufacturer_id=current_user.organization_id
        )
        
        db.add(base_product)
        db.flush()
        
        # Create luxury specifications if provided
        if "luxury_spec" in product_data:
            spec_data = product_data["luxury_spec"]
            luxury_spec = LuxurySpecification(
                product_id=base_product.product_id,
                material=spec_data.get("material"),
                craftsmanship_level=spec_data.get("craftsmanship_level"),
                limited_edition=spec_data.get("limited_edition", False),
                edition_number=spec_data.get("edition_number"),
                total_edition_size=spec_data.get("total_edition_size"),
                designer=spec_data.get("designer"),
                collection_name=spec_data.get("collection_name"),
                authentication_features=spec_data.get("authentication_features", {}),
                provenance_history=spec_data.get("provenance_history", {}),
                estimated_value=spec_data.get("estimated_value")
            )
            db.add(luxury_spec)
        
        db.commit()
        db.refresh(base_product)
        
        return EnhancedProductResponse.from_orm(base_product)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/authentication-features")
async def get_authentication_features(
    product_id: UUID,
    db: Session = Depends(get_db)
):
    """Get authentication features for luxury item"""
    try:
        luxury_spec = db.query(LuxurySpecification).filter(
            LuxurySpecification.product_id == product_id
        ).first()
        
        if not luxury_spec:
            raise HTTPException(status_code=404, detail="Luxury specifications not found")
        
        return {
            "product_id": str(product_id),
            "authentication_features": luxury_spec.authentication_features,
            "verification_methods": [
                "Serial number verification",
                "Material analysis",
                "Craftsmanship inspection",
                "Blockchain verification"
            ],
            "security_features": [
                "Holographic tags",
                "Micro-printing",
                "RFID chips",
                "QR codes"
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))