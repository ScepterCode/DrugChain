import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Boolean, DateTime, ForeignKey, Text, ARRAY
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from app.db.session import Base


class Product(Base):
    __tablename__ = "products"

    product_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    manufacturer_id = Column(UUID(as_uuid=True), ForeignKey("manufacturers.manufacturer_id"), nullable=False)
    
    # Basic Product Info (industry-agnostic)
    product_code = Column(String(50), unique=True, nullable=False)
    product_name = Column(String(255), nullable=False)
    description = Column(Text)
    
    # Multi-industry support
    industry_type = Column(String(50), default="Healthcare")  # Healthcare, Technology, Fashion, Automotive, etc.
    industry_data = Column(JSONB, default={})  # Industry-specific attributes stored as JSON
    
    # Generic regulatory field (replaces nafdac_registration_number)
    regulatory_registration = Column(String(100))
    
    # DEPRECATED: Legacy pharmaceutical fields (kept for backward compatibility)
    # These should be migrated to industry_data for Healthcare products
    dosage = Column(String(100))  # DEPRECATED: Use industry_data.dosage
    form = Column(String(50))  # DEPRECATED: Use industry_data.form
    active_ingredients = Column(ARRAY(String))  # DEPRECATED: Use industry_data.active_ingredients
    therapeutic_category = Column(String(100))  # DEPRECATED: Use industry_data.therapeutic_category
    requires_prescription = Column(Boolean, default=False)  # DEPRECATED: Use industry_data.requires_prescription
    nafdac_registration_number = Column(String(100))  # DEPRECATED: Use regulatory_registration
    
    # Status and Metadata
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships (only to existing tables)
    manufacturer = relationship("Manufacturer", back_populates="products")
    batches = relationship("Batch", back_populates="product")

    def __repr__(self):
        return f"<Product {self.product_name}>"

    def get_attribute_value(self, attribute_name: str):
        """Get the value of a specific attribute"""
        # Placeholder for future implementation
        return None

    def get_certification(self, certification_type: str):
        """Get a specific certification"""
        # Placeholder for future implementation
        return None
