import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Text, Integer, Date
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from app.db.session import Base


class ProductCategory(Base):
    __tablename__ = "product_categories"

    category_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    category_name = Column(String(100), nullable=False)
    category_code = Column(String(20), unique=True, nullable=False)
    parent_category_id = Column(UUID(as_uuid=True), ForeignKey("product_categories.category_id"))
    industry_type = Column(String(50), nullable=False)
    description = Column(Text)
    regulatory_requirements = Column(JSONB, default={})
    verification_rules = Column(JSONB, default={})
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    parent_category = relationship("ProductCategory", remote_side=[category_id])
    subcategories = relationship("ProductCategory", back_populates="parent_category")
    products = relationship("Product", back_populates="category")

    def __repr__(self):
        return f"<ProductCategory {self.category_name}>"


class ProductAttribute(Base):
    __tablename__ = "product_attributes"

    attribute_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    product_id = Column(UUID(as_uuid=True), ForeignKey("products.product_id", ondelete="CASCADE"), nullable=False)
    attribute_name = Column(String(100), nullable=False)
    attribute_value = Column(Text)
    attribute_type = Column(String(50), default="text")  # text, number, date, boolean, json, url
    display_order = Column(Integer, default=0)
    is_required = Column(Boolean, default=False)
    is_public = Column(Boolean, default=True)
    verification_level = Column(String(20), default="basic")  # basic, enhanced, critical
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    product = relationship("Product", back_populates="attributes")

    def __repr__(self):
        return f"<ProductAttribute {self.attribute_name}: {self.attribute_value}>"


class Certification(Base):
    __tablename__ = "certifications"

    certification_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    product_id = Column(UUID(as_uuid=True), ForeignKey("products.product_id", ondelete="CASCADE"), nullable=False)
    certification_type = Column(String(100), nullable=False)
    certification_name = Column(String(200), nullable=False)
    issuing_authority = Column(String(200))
    certificate_number = Column(String(100))
    issue_date = Column(Date)
    expiry_date = Column(Date)
    verification_url = Column(Text)
    document_hash = Column(String(64))  # For blockchain verification
    status = Column(String(20), default="active")  # active, expired, revoked, pending
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    product = relationship("Product", back_populates="certifications")

    def __repr__(self):
        return f"<Certification {self.certification_name}>"