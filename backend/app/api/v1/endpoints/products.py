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
    import logging
    import traceback
    logger = logging.getLogger(__name__)
    
    logger.info(f"=== PRODUCT CREATION DEBUG ===")
    logger.info(f"User: {current_user.user_id} ({current_user.role.value})")
    logger.info(f"Organization ID: {current_user.organization_id}")
    logger.info(f"Product data: {product_data.dict()}")
    
    try:
        # Get manufacturer
        logger.info("Step 1: Getting manufacturer...")
        manufacturer = db.query(Manufacturer).filter(
            Manufacturer.manufacturer_id == current_user.organization_id
        ).first()
        
        if not manufacturer:
            logger.error(f"No manufacturer found for organization_id: {current_user.organization_id}")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User must be associated with a manufacturer organization"
            )
        
        logger.info(f"Found manufacturer: {manufacturer.manufacturer_id}")
        
        # Check if product code already exists
        logger.info("Step 2: Checking product code uniqueness...")
        existing = db.query(Product).filter(Product.product_code == product_data.product_code).first()
        if existing:
            logger.error(f"Product code already exists: {product_data.product_code}")
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Product with code '{product_data.product_code}' already exists"
            )
        
        # Create product data dictionary with ONLY core fields that definitely exist
        logger.info("Step 3: Preparing minimal product data...")
        
        # Start with only the absolutely required fields
        minimal_product_dict = {
            'manufacturer_id': manufacturer.manufacturer_id,
            'product_code': product_data.product_code,
            'product_name': product_data.product_name,
        }
        
        # Add optional fields only if they exist in the model
        product_dict = product_data.dict(exclude_unset=True)
        
        # Safe fields that should exist in the original schema
        safe_fields = ['description', 'dosage', 'form', 'therapeutic_category', 
                      'requires_prescription', 'nafdac_registration_number']
        
        for field in safe_fields:
            if field in product_dict:
                minimal_product_dict[field] = product_dict[field]
        
        # Try to add new fields with error handling
        new_fields = ['industry_type', 'industry_data', 'regulatory_registration',
                     'brand_name', 'country_of_origin', 'category_id', 'model_number',
                     'warranty_period_months', 'risk_level', 'verification_complexity']
        
        for field in new_fields:
            if field in product_dict:
                try:
                    # Test if the field exists by creating a temporary product
                    temp_product = Product()
                    if hasattr(temp_product, field):
                        minimal_product_dict[field] = product_dict[field]
                        logger.info(f"Added field: {field}")
                    else:
                        logger.warning(f"Field {field} not found in Product model, skipping")
                except Exception as e:
                    logger.warning(f"Error checking field {field}: {str(e)}")
        
        # Set safe defaults
        if 'industry_type' not in minimal_product_dict:
            minimal_product_dict['industry_type'] = 'Healthcare'
        if 'industry_data' not in minimal_product_dict:
            minimal_product_dict['industry_data'] = {}
        if 'risk_level' not in minimal_product_dict:
            minimal_product_dict['risk_level'] = 'medium'
        if 'verification_complexity' not in minimal_product_dict:
            minimal_product_dict['verification_complexity'] = 'standard'
        
        logger.info(f"Final minimal product dict: {minimal_product_dict}")
        
        # Create new product with error handling for each step
        logger.info("Step 4: Creating Product object...")
        try:
            new_product = Product(**minimal_product_dict)
            logger.info("Product object created successfully")
        except Exception as e:
            logger.error(f"Failed to create Product object: {str(e)}")
            logger.error(f"Traceback: {traceback.format_exc()}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Product model validation failed: {str(e)}"
            )
        
        logger.info("Step 5: Adding to database session...")
        try:
            db.add(new_product)
            logger.info("Added to session successfully")
        except Exception as e:
            logger.error(f"Failed to add to session: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Database session error: {str(e)}"
            )
        
        logger.info("Step 6: Committing to database...")
        try:
            db.commit()
            logger.info("Committed successfully")
        except Exception as e:
            logger.error(f"Failed to commit: {str(e)}")
            logger.error(f"Traceback: {traceback.format_exc()}")
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Database commit failed: {str(e)}"
            )
        
        logger.info("Step 7: Refreshing object...")
        try:
            db.refresh(new_product)
            logger.info("Refreshed successfully")
        except Exception as e:
            logger.error(f"Failed to refresh: {str(e)}")
            # Don't fail here, just log the error
        
        logger.info(f"Successfully created product {new_product.product_code} for manufacturer {manufacturer.manufacturer_id}")
        return ProductResponse.from_orm(new_product)
        
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Unexpected error in product creation: {str(e)}")
        logger.error(f"Full traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create product: {str(e)}"
        )


# Add a debug endpoint to test database connectivity
@router.post("/debug-test", status_code=status.HTTP_200_OK)
async def debug_product_creation(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["MANUFACTURER"]))
):
    """Debug endpoint to test product creation components"""
    import logging
    logger = logging.getLogger(__name__)
    
    try:
        # Test 1: Check manufacturer exists
        manufacturer = db.query(Manufacturer).filter(
            Manufacturer.manufacturer_id == current_user.organization_id
        ).first()
        
        manufacturer_status = "✅ Found" if manufacturer else "❌ Not found"
        
        # Test 2: Check Product model fields
        temp_product = Product()
        model_fields = [attr for attr in dir(temp_product) if not attr.startswith('_')]
        
        # Test 3: Check database connection
        try:
            db.execute("SELECT 1")
            db_status = "✅ Connected"
        except Exception as e:
            db_status = f"❌ Error: {str(e)}"
        
        return {
            "user_id": str(current_user.user_id),
            "organization_id": str(current_user.organization_id),
            "manufacturer_status": manufacturer_status,
            "manufacturer_id": str(manufacturer.manufacturer_id) if manufacturer else None,
            "database_status": db_status,
            "product_model_fields": model_fields[:20],  # First 20 fields
            "total_model_fields": len(model_fields)
        }
        
    except Exception as e:
        logger.error(f"Debug test failed: {str(e)}")
        return {
            "error": str(e),
            "user_id": str(current_user.user_id) if current_user else None
        }


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
    current_user: User = Depends(require_role(["MANUFACTURER"]))
):
    """Update an existing product - only manufacturers can update their own products"""
    import logging
    logger = logging.getLogger(__name__)
    
    try:
        # Check if product exists
        product = db.query(Product).filter(Product.product_id == product_id).first()
        
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found"
            )
        
        # Check authorization - only manufacturer can update their own products
        if product.manufacturer_id != current_user.organization_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only update your own products"
            )
        
        # Get update data, excluding unset fields
        update_data = product_data.dict(exclude_unset=True)
        
        # Update product fields
        for field, value in update_data.items():
            if hasattr(product, field):
                setattr(product, field, value)
                logger.info(f"Updated {field} for product {product_id}")
        
        # Always update timestamp
        product.updated_at = datetime.utcnow()
        
        # Commit changes
        db.commit()
        db.refresh(product)
        
        logger.info(f"Successfully updated product {product_id}")
        return ProductResponse.from_orm(product)
        
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        logger.error(f"Failed to update product {product_id}: {str(e)}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update product: {str(e)}"
        )


@router.patch("/{product_id}/archive", response_model=ProductResponse)
async def archive_product(
    product_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["MANUFACTURER"]))
):
    """Archive a product (set is_active to False) - only manufacturers can archive their own products"""
    product = db.query(Product).filter(Product.product_id == product_id).first()
    
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    # Check if user owns this product
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
        return ProductResponse.from_orm(product)
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
    current_user: User = Depends(require_role(["MANUFACTURER"]))
):
    """Reactivate an archived product (set is_active to True) - only manufacturers can reactivate their own products"""
    product = db.query(Product).filter(Product.product_id == product_id).first()
    
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    # Check if user owns this product
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
        return ProductResponse.from_orm(product)
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to reactivate product: {str(e)}"
        )
