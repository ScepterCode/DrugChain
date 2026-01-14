import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Boolean, DateTime, ForeignKey, Text, ARRAY
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.db.session import Base


class Product(Base):
    __tablename__ = "products"

    product_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    manufacturer_id = Column(UUID(as_uuid=True), ForeignKey("manufacturers.manufacturer_id"), nullable=False)
    
    # Basic Product Info
    product_code = Column(String(50), unique=True, nullable=False)
    product_name = Column(String(255), nullable=False)
    description = Column(Text)
    
    # Category and Industry (new fields)
    category_id = Column(UUID(as_uuid=True), ForeignKey("product_categories.category_id"))
    industry_type = Column(String(50), default="Healthcare")
    brand_name = Column(String(200))
    model_number = Column(String(100))
    country_of_origin = Column(String(100))
    warranty_period_months = Column(Integer)
    risk_level = Column(String(20), default="medium")  # low, medium, high, critical
    verification_complexity = Column(String(20), default="standard")  # basic, standard, enhanced, premium
    
    # Legacy pharmaceutical fields (maintained for backward compatibility)
    dosage = Column(String(100))
    form = Column(String(50))  # Tablet, Syrup, Injection, etc.
    active_ingredients = Column(ARRAY(String))
    therapeutic_category = Column(String(100))
    requires_prescription = Column(Boolean, default=True)
    nafdac_registration_number = Column(String(100))
    
    # Status and Metadata
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    manufacturer = relationship("Manufacturer", back_populates="products")
    category = relationship("ProductCategory", back_populates="products")
    attributes = relationship("ProductAttribute", back_populates="product", cascade="all, delete-orphan")
    certifications = relationship("Certification", back_populates="product", cascade="all, delete-orphan")
    batches = relationship("Batch", back_populates="product")
    
    # Industry-specific specifications (one-to-one relationships)
    electronics_spec = relationship("ElectronicsSpecification", back_populates="product", uselist=False, cascade="all, delete-orphan")
    luxury_spec = relationship("LuxurySpecification", back_populates="product", uselist=False, cascade="all, delete-orphan")
    food_spec = relationship("FoodSpecification", back_populates="product", uselist=False, cascade="all, delete-orphan")
    automotive_spec = relationship("AutomotiveSpecification", back_populates="product", uselist=False, cascade="all, delete-orphan")
    cosmetics_spec = relationship("CosmeticsSpecification", back_populates="product", uselist=False, cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Product {self.product_name}>"

    @property
    def industry_category(self):
        """Get the industry category for this product"""
        return self.category.industry_type if self.category else self.industry_type

    def get_attribute_value(self, attribute_name: str):
        """Get the value of a specific attribute"""
        for attr in self.attributes:
            if attr.attribute_name == attribute_name:
                return attr.attribute_value
        return None

    def get_certification(self, certification_type: str):
        """Get a specific certification"""
        for cert in self.certifications:
            if cert.certification_type == certification_type and cert.status == "active":
                return cert
        return None
