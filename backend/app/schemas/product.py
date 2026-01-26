from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, date
from uuid import UUID


# Product Schemas
class ProductBase(BaseModel):
    product_code: str
    product_name: str
    description: Optional[str] = None
    
    # Multi-industry support
    industry_type: Optional[str] = "Healthcare"
    industry_data: Optional[dict] = {}
    regulatory_registration: Optional[str] = None
    
    # Additional fields from frontend form
    brand_name: Optional[str] = None
    country_of_origin: Optional[str] = None
    category_id: Optional[str] = None
    model_number: Optional[str] = None
    warranty_period_months: Optional[int] = None
    risk_level: Optional[str] = "medium"
    verification_complexity: Optional[str] = "standard"
    
    # Legacy pharmaceutical fields (deprecated but kept for backward compatibility)
    dosage: Optional[str] = None
    form: Optional[str] = None
    active_ingredients: Optional[List[str]] = None
    therapeutic_category: Optional[str] = None
    requires_prescription: bool = False
    nafdac_registration_number: Optional[str] = None


class ProductCreate(ProductBase):
    pass


class ProductResponse(ProductBase):
    product_id: UUID
    manufacturer_id: UUID
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


# Batch Schemas
class BatchCreate(BaseModel):
    product_id: UUID
    production_date: date
    expiry_date: date
    batch_size: int
    number_of_cartons: int
    packs_per_carton: int
    quality_certificate_url: Optional[str] = None


class BatchResponse(BaseModel):
    batch_id: str
    product_id: UUID
    product_name: Optional[str] = None
    manufacturer_id: UUID
    production_date: date
    expiry_date: date
    batch_size: int
    total_packs: int
    status: str
    blockchain_tx_id: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


# Pack Schemas
class PackResponse(BaseModel):
    pack_id: str
    batch_id: str
    status: str
    qr_code_url: Optional[str] = None
    verification_count: int
    created_at: datetime
    
    class Config:
        from_attributes = True
