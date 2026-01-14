from pydantic import BaseModel, validator
from typing import Optional, List, Dict, Any
from datetime import datetime, date
from uuid import UUID


# Product Category Schemas
class ProductCategoryBase(BaseModel):
    category_name: str
    category_code: str
    parent_category_id: Optional[UUID] = None
    industry_type: str
    description: Optional[str] = None
    regulatory_requirements: Optional[Dict[str, Any]] = {}
    verification_rules: Optional[Dict[str, Any]] = {}
    is_active: bool = True


class ProductCategoryCreate(ProductCategoryBase):
    pass


class ProductCategoryUpdate(BaseModel):
    category_name: Optional[str] = None
    description: Optional[str] = None
    regulatory_requirements: Optional[Dict[str, Any]] = None
    verification_rules: Optional[Dict[str, Any]] = None
    is_active: Optional[bool] = None


class ProductCategoryResponse(ProductCategoryBase):
    category_id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Product Attribute Schemas
class ProductAttributeBase(BaseModel):
    attribute_name: str
    attribute_value: Optional[str] = None
    attribute_type: str = "text"  # text, number, date, boolean, json, url
    display_order: int = 0
    is_required: bool = False
    is_public: bool = True
    verification_level: str = "basic"  # basic, enhanced, critical


class ProductAttributeCreate(ProductAttributeBase):
    pass


class ProductAttributeUpdate(BaseModel):
    attribute_value: Optional[str] = None
    attribute_type: Optional[str] = None
    display_order: Optional[int] = None
    is_required: Optional[bool] = None
    is_public: Optional[bool] = None
    verification_level: Optional[str] = None


class ProductAttributeResponse(ProductAttributeBase):
    attribute_id: UUID
    product_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True


# Certification Schemas
class CertificationBase(BaseModel):
    certification_type: str
    certification_name: str
    issuing_authority: Optional[str] = None
    certificate_number: Optional[str] = None
    issue_date: Optional[date] = None
    expiry_date: Optional[date] = None
    verification_url: Optional[str] = None
    document_hash: Optional[str] = None
    status: str = "active"  # active, expired, revoked, pending


class CertificationCreate(CertificationBase):
    pass


class CertificationUpdate(BaseModel):
    certification_name: Optional[str] = None
    issuing_authority: Optional[str] = None
    certificate_number: Optional[str] = None
    issue_date: Optional[date] = None
    expiry_date: Optional[date] = None
    verification_url: Optional[str] = None
    document_hash: Optional[str] = None
    status: Optional[str] = None


class CertificationResponse(CertificationBase):
    certification_id: UUID
    product_id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Enhanced Product Schemas
class EnhancedProductBase(BaseModel):
    product_code: str
    product_name: str
    description: Optional[str] = None
    category_id: Optional[UUID] = None
    industry_type: str = "Healthcare"
    brand_name: Optional[str] = None
    model_number: Optional[str] = None
    country_of_origin: Optional[str] = None
    warranty_period_months: Optional[int] = None
    risk_level: str = "medium"  # low, medium, high, critical
    verification_complexity: str = "standard"  # basic, standard, enhanced, premium
    
    # Legacy pharmaceutical fields (for backward compatibility)
    dosage: Optional[str] = None
    form: Optional[str] = None
    active_ingredients: Optional[List[str]] = None
    therapeutic_category: Optional[str] = None
    requires_prescription: bool = False
    nafdac_registration_number: Optional[str] = None


class EnhancedProductCreate(EnhancedProductBase):
    manufacturer_id: UUID
    attributes: Optional[List[ProductAttributeCreate]] = []
    certifications: Optional[List[CertificationCreate]] = []


class EnhancedProductUpdate(BaseModel):
    product_name: Optional[str] = None
    description: Optional[str] = None
    category_id: Optional[UUID] = None
    industry_type: Optional[str] = None
    brand_name: Optional[str] = None
    model_number: Optional[str] = None
    country_of_origin: Optional[str] = None
    warranty_period_months: Optional[int] = None
    risk_level: Optional[str] = None
    verification_complexity: Optional[str] = None
    is_active: Optional[bool] = None
    
    # Legacy fields
    dosage: Optional[str] = None
    form: Optional[str] = None
    active_ingredients: Optional[List[str]] = None
    therapeutic_category: Optional[str] = None
    requires_prescription: Optional[bool] = None
    nafdac_registration_number: Optional[str] = None


class EnhancedProductResponse(EnhancedProductBase):
    product_id: UUID
    manufacturer_id: UUID
    category: Optional[ProductCategoryResponse] = None
    attributes: List[ProductAttributeResponse] = []
    certifications: List[CertificationResponse] = []
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Industry-Specific Product Schemas
class ElectronicsProductCreate(EnhancedProductCreate):
    # Electronics-specific fields
    processor: Optional[str] = None
    memory_gb: Optional[int] = None
    storage_gb: Optional[int] = None
    display_size: Optional[float] = None
    battery_capacity: Optional[int] = None
    operating_system: Optional[str] = None
    connectivity: Optional[Dict[str, Any]] = {}
    dimensions: Optional[Dict[str, Any]] = {}
    compatibility_matrix: Optional[Dict[str, Any]] = {}


class LuxuryProductCreate(EnhancedProductCreate):
    # Luxury-specific fields
    material: Optional[str] = None
    craftsmanship_level: Optional[str] = None
    limited_edition: bool = False
    edition_number: Optional[int] = None
    total_edition_size: Optional[int] = None
    designer: Optional[str] = None
    collection_name: Optional[str] = None
    authentication_features: Optional[Dict[str, Any]] = {}
    estimated_value: Optional[float] = None


class FoodProductCreate(EnhancedProductCreate):
    # Food-specific fields
    nutritional_info: Optional[Dict[str, Any]] = {}
    allergens: Optional[List[str]] = []
    dietary_restrictions: Optional[List[str]] = []  # vegan, gluten-free, kosher, halal
    origin_location: Optional[str] = None
    harvest_date: Optional[date] = None
    processing_date: Optional[date] = None
    storage_requirements: Optional[Dict[str, Any]] = {}
    shelf_life_days: Optional[int] = None
    organic_certified: bool = False
    fair_trade_certified: bool = False


class AutomotiveProductCreate(EnhancedProductCreate):
    # Automotive-specific fields
    part_category: Optional[str] = None  # engine, brake, electrical, body, etc.
    oem_part_number: Optional[str] = None
    compatible_vehicles: Optional[Dict[str, Any]] = {}  # make, model, year ranges
    safety_critical: bool = False
    installation_complexity: str = "medium"
    warranty_terms: Optional[Dict[str, Any]] = {}
    recall_history: Optional[Dict[str, Any]] = {}
    performance_specs: Optional[Dict[str, Any]] = {}


class CosmeticsProductCreate(EnhancedProductCreate):
    # Cosmetics-specific fields
    ingredients: Optional[Dict[str, Any]] = {}
    skin_type_suitability: Optional[List[str]] = []
    usage_instructions: Optional[str] = None
    safety_warnings: Optional[str] = None
    dermatologically_tested: bool = False
    cruelty_free: bool = False
    natural_percentage: Optional[float] = None
    spf_rating: Optional[int] = None
    color_shade: Optional[str] = None