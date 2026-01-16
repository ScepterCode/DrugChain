from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID

from app.db.session import get_db
from app.models import User
from app.models.product_category import ProductCategory  # Direct import
from app.schemas.product_category import (
    ProductCategoryCreate,
    ProductCategoryUpdate,
    ProductCategoryResponse
)
from app.api.dependencies import get_current_user, require_role

router = APIRouter()


@router.get("/", response_model=List[ProductCategoryResponse])
async def list_categories(
    industry_type: Optional[str] = Query(None, description="Filter by industry type"),
    parent_id: Optional[UUID] = Query(None, description="Filter by parent category"),
    include_inactive: bool = Query(False, description="Include inactive categories"),
    db: Session = Depends(get_db)
):
    """
    List product categories with optional filtering.
    Public endpoint - no authentication required.
    """
    query = db.query(ProductCategory)
    
    if industry_type:
        query = query.filter(ProductCategory.industry_type == industry_type)
    
    if parent_id:
        query = query.filter(ProductCategory.parent_category_id == parent_id)
    
    if not include_inactive:
        query = query.filter(ProductCategory.is_active == True)
    
    categories = query.order_by(ProductCategory.category_name).all()
    return [ProductCategoryResponse.from_orm(cat) for cat in categories]


@router.get("/industries", response_model=List[str])
async def list_industries(db: Session = Depends(get_db)):
    """
    Get list of all available industries.
    Public endpoint - no authentication required.
    """
    industries = db.query(ProductCategory.industry_type).distinct().all()
    return [industry[0] for industry in industries]


@router.get("/{category_id}", response_model=ProductCategoryResponse)
async def get_category(
    category_id: UUID,
    db: Session = Depends(get_db)
):
    """
    Get a specific category by ID.
    Public endpoint - no authentication required.
    """
    category = db.query(ProductCategory).filter(
        ProductCategory.category_id == category_id
    ).first()
    
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )
    
    return ProductCategoryResponse.from_orm(category)


@router.post("/", response_model=ProductCategoryResponse, status_code=status.HTTP_201_CREATED)
async def create_category(
    category_data: ProductCategoryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["SYSTEM_ADMIN", "REGULATOR"]))
):
    """
    Create a new product category.
    Requires SYSTEM_ADMIN or REGULATOR role.
    """
    # Check if category code already exists
    existing = db.query(ProductCategory).filter(
        ProductCategory.category_code == category_data.category_code
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Category with code '{category_data.category_code}' already exists"
        )
    
    # Validate parent category if provided
    if category_data.parent_category_id:
        parent = db.query(ProductCategory).filter(
            ProductCategory.category_id == category_data.parent_category_id
        ).first()
        
        if not parent:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Parent category not found"
            )
    
    # Create category
    category = ProductCategory(**category_data.dict())
    db.add(category)
    db.commit()
    db.refresh(category)
    
    return ProductCategoryResponse.from_orm(category)


@router.put("/{category_id}", response_model=ProductCategoryResponse)
async def update_category(
    category_id: UUID,
    category_data: ProductCategoryUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["SYSTEM_ADMIN", "REGULATOR"]))
):
    """
    Update a product category.
    Requires SYSTEM_ADMIN or REGULATOR role.
    """
    category = db.query(ProductCategory).filter(
        ProductCategory.category_id == category_id
    ).first()
    
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )
    
    # Update fields
    update_data = category_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(category, field, value)
    
    db.commit()
    db.refresh(category)
    
    return ProductCategoryResponse.from_orm(category)


@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_category(
    category_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["SYSTEM_ADMIN"]))
):
    """
    Delete a product category.
    Requires SYSTEM_ADMIN role.
    Note: This will fail if there are products using this category.
    """
    category = db.query(ProductCategory).filter(
        ProductCategory.category_id == category_id
    ).first()
    
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )
    
    # Check if category has products (disabled until migration is applied)
    # TODO: Re-enable this check after migration is applied
    # if category.products:
    #     raise HTTPException(
    #         status_code=status.HTTP_400_BAD_REQUEST,
    #         detail="Cannot delete category that has products. Move products to another category first."
    #     )
    
    # Check if category has subcategories
    if category.subcategories:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete category that has subcategories. Delete subcategories first."
        )
    
    db.delete(category)
    db.commit()


@router.get("/{category_id}/subcategories", response_model=List[ProductCategoryResponse])
async def get_subcategories(
    category_id: UUID,
    db: Session = Depends(get_db)
):
    """
    Get all subcategories of a specific category.
    Public endpoint - no authentication required.
    """
    subcategories = db.query(ProductCategory).filter(
        ProductCategory.parent_category_id == category_id,
        ProductCategory.is_active == True
    ).order_by(ProductCategory.category_name).all()
    
    return [ProductCategoryResponse.from_orm(cat) for cat in subcategories]


@router.get("/industry/{industry_type}", response_model=List[ProductCategoryResponse])
async def get_categories_by_industry(
    industry_type: str,
    include_subcategories: bool = Query(True, description="Include subcategories"),
    db: Session = Depends(get_db)
):
    """
    Get all categories for a specific industry.
    Public endpoint - no authentication required.
    """
    query = db.query(ProductCategory).filter(
        ProductCategory.industry_type == industry_type,
        ProductCategory.is_active == True
    )
    
    if not include_subcategories:
        query = query.filter(ProductCategory.parent_category_id.is_(None))
    
    categories = query.order_by(ProductCategory.category_name).all()
    return [ProductCategoryResponse.from_orm(cat) for cat in categories]