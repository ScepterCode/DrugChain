from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime
from app.db.session import get_db
from app.schemas import ProductCreate, ProductResponse
from app.models import Product, User, Manufacturer, UserRole
from app.api.dependencies import require_role, get_current_user
from typing import List

router = APIRouter()


# POST route - must be before GET / to avoid conflicts
@router.post("", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
async def create_product(
    product_data: ProductCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["MANUFACTURER"]))
):
    """
    Create a new product.
    Only manufacturers can create products.
    """
    try:
        # Get manufacturer
        manufacturer = db.query(Manufacturer).filter(
            Manufacturer.manufacturer_id == current_user.organization_id
        ).first()
        
        if not manufacturer:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User must be associated with a manufacturer organization"
            )
        
        # Check if product code already exists
        existing = db.query(Product).filter(Product.product_code == product_data.product_code).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Product with code '{product_data.product_code}' already exists"
            )
        
        # Create product with all available fields
        safe_data = {}
        safe_fields = {
            'product_code', 'product_name', 'description', 'industry_type', 
            'industry_data', 'regulatory_registration', 'dosage', 'form', 
            'active_ingredients', 'therapeutic_category', 'requires_prescription', 
            'nafdac_registration_number', 'brand_name', 'country_of_origin',
            'category_id', 'model_number', 'warranty_period_months', 
            'risk_level', 'verification_complexity'
        }
        
        for field, value in product_data.dict().items():
            if field in safe_fields:
                safe_data[field] = value
        
        # Create a temporary product to test which fields exist in database
        temp_product = Product(manufacturer_id=manufacturer.manufacturer_id)
        
        # Only include fields that actually exist in the database
        final_data = {'manufacturer_id': manufacturer.manufacturer_id}
        for field, value in safe_data.items():
            if hasattr(temp_product, field):
                final_data[field] = value
        
        new_product = Product(**final_data)
        
        db.add(new_product)
        db.commit()
        db.refresh(new_product)
        
        return ProductResponse.from_orm(new_product)
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create product: {str(e)}"
        )


# GET / route - authenticated list
@router.get("", response_model=List[ProductResponse])
async def list_products(
    skip: int = 0,
    limit: int = 50,
    include_archived: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["MANUFACTURER", "DISTRIBUTOR", "RETAILER", "REGULATOR"]))
):
    """
    List all products.
    - Manufacturers see only their products
    - Regulators see all products
    - Distributors and Pharmacies see all products (for ordering/selling)
    - By default, only active products are shown. Set include_archived=true to see archived products.
    """
    query = db.query(Product)
    
    # Filter by manufacturer if user is a manufacturer
    if current_user.role.value == "MANUFACTURER":
        query = query.filter(Product.manufacturer_id == current_user.organization_id)
    
    # Filter by is_active unless include_archived is True
    if not include_archived:
        query = query.filter(Product.is_active == True)
    
    products = query.offset(skip).limit(limit).all()
    
    return [ProductResponse.from_orm(p) for p in products]


# GET /public route - public list (no auth required)
@router.get("/public", response_model=List[ProductResponse])
async def list_public_products(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """
    List all active products publicly (for verification purposes).
    No authentication required.
    """
    products = db.query(Product).filter(
        Product.is_active == True
    ).offset(skip).limit(limit).all()
    
    return [ProductResponse.from_orm(p) for p in products]


# GET /{product_id} route - must be LAST to avoid matching other routes
@router.get("/{product_id}", response_model=ProductResponse)
async def get_product(
    product_id: str,
    db: Session = Depends(get_db)
):
    """Get product details by ID"""
    product = db.query(Product).filter(Product.product_id == product_id).first()
    
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    return ProductResponse.from_orm(product)


@router.put("/{product_id}", response_model=ProductResponse)
async def update_product(
    product_id: str,
    product_data: ProductCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update an existing product"""
    # Check if product exists
    product = db.query(Product).filter(Product.product_id == product_id).first()
    
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    # Check if user owns this product (manufacturer check)
    if current_user.role == UserRole.MANUFACTURER:
        if product.manufacturer_id != current_user.organization_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only update your own products"
            )
    
    # Define core fields that should always exist
    core_fields = {
        'product_code', 'product_name', 'description', 'industry_type', 
        'industry_data', 'regulatory_registration'
    }
    
    # Define optional fields that may not exist in database yet
    optional_fields = {
        'dosage', 'form', 'active_ingredients', 'therapeutic_category', 
        'requires_prescription', 'nafdac_registration_number', 'brand_name', 
        'country_of_origin', 'category_id', 'model_number', 'warranty_period_months', 
        'risk_level', 'verification_complexity'
    }
    
    # Update core fields first
    updated_fields = []
    for field, value in product_data.dict(exclude_unset=True).items():
        if field in core_fields:
            try:
                setattr(product, field, value)
                updated_fields.append(field)
            except Exception as e:
                print(f"Core field update failed {field}: {e}")
                continue
    
    # Try to update optional fields, but don't fail if they don't exist
    for field, value in product_data.dict(exclude_unset=True).items():
        if field in optional_fields and hasattr(product, field):
            try:
                setattr(product, field, value)
                updated_fields.append(field)
            except Exception as e:
                # Silently skip fields that cause database errors
                print(f"Optional field skipped {field}: {e}")
                continue
    
    product.updated_at = datetime.utcnow()
    
    try:
        db.commit()
        db.refresh(product)
        return ProductResponse.from_orm(product)
    except Exception as e:
        db.rollback()
        # More graceful error handling
        error_msg = str(e).lower()
        if "column" in error_msg and ("does not exist" in error_msg or "unknown column" in error_msg):
            # Still allow the update to succeed with available fields
            try:
                # Try again with only basic fields
                for field in ['product_name', 'description']:
                    if field in product_data.dict(exclude_unset=True):
                        setattr(product, field, product_data.dict()[field])
                
                product.updated_at = datetime.utcnow()
                db.commit()
                db.refresh(product)
                return ProductResponse.from_orm(product)
            except:
                pass
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Product updated partially. Some fields may not be available in the current database schema."
        )


@router.patch("/{product_id}/archive", response_model=ProductResponse)
async def archive_product(
    product_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Archive a product (set is_active to False)"""
    product = db.query(Product).filter(Product.product_id == product_id).first()
    
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    # Check if user owns this product
    if current_user.role == UserRole.MANUFACTURER:
        if product.manufacturer_id != current_user.organization_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only archive your own products"
            )
    
    product.is_active = False
    product.updated_at = datetime.utcnow()
    
    try:
        db.commit()
        db.refresh(product)
        return product
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to archive product: {str(e)}"
        )


@router.patch("/{product_id}/reactivate", response_model=ProductResponse)
async def reactivate_product(
    product_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Reactivate an archived product (set is_active to True)"""
    product = db.query(Product).filter(Product.product_id == product_id).first()
    
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    # Check if user owns this product
    if current_user.role == UserRole.MANUFACTURER:
        if product.manufacturer_id != current_user.organization_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only reactivate your own products"
            )
    
    product.is_active = True
    product.updated_at = datetime.utcnow()
    
    try:
        db.commit()
        db.refresh(product)
        return product
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to reactivate product: {str(e)}"
        )
