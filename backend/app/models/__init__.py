# Import all models here for easy access
from app.models.user import User, UserRole
from app.models.organization import Organization, Manufacturer, OrganizationType, LicenseStatus
from app.models.product import Product
# from app.models.product_category import ProductCategory, ProductAttribute, Certification  # Temporarily disabled
from app.models.batch import Batch, Carton, Pack, BatchStatus, PackStatus
from app.models.industry_specifications import (
    ElectronicsSpecification,
    LuxurySpecification,
    FoodSpecification,
    AutomotiveSpecification,
    CosmeticsSpecification
)

__all__ = [
    "User",
    "UserRole",
    "Organization",
    "Manufacturer",
    "OrganizationType",
    "LicenseStatus",
    "Product",
    # "ProductCategory",  # Temporarily disabled
    # "ProductAttribute",  # Temporarily disabled
    # "Certification",  # Temporarily disabled
    "Batch",
    "Carton",
    "Pack",
    "BatchStatus",
    "PackStatus",
    "ElectronicsSpecification",
    "LuxurySpecification",
    "FoodSpecification",
    "AutomotiveSpecification",
    "CosmeticsSpecification",
]
