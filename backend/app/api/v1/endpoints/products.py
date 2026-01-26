from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas import ProductCreate, ProductResponse
from app.models import Product, User, Manufacturer
from app.api.dependencies import require_role
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
        
        # Create product
        new_product = Product(
            manufacturer_id=manufacturer.manufacturer_id,
            **product_data.dict()
        )
        
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
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["MANUFACTURER", "DISTRIBUTOR", "RETAILER", "REGULATOR"]))
):
    """
    List all products.
    - Manufacturers see only their products
    - Regulators see all products
    - Distributors and Pharmacies see all products (for ordering/selling)
    """
    query = db.query(Product)
    
    # Filter by manufacturer if user is a manufacturer
    if current_user.role.value == "MANUFACTURER":
        query = query.filter(Product.manufacturer_id == current_user.organization_id)
    
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
    
    # Update product fields
    for field, value in product_data.dict(exclude_unset=True).items():
        if hasattr(product, field):
            setattr(product, field, value)
    
    product.updated_at = datetime.utcnow()
    
    try:
        db.commit()
        db.refresh(product)
        return product
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update product: {str(e)}"
        )
