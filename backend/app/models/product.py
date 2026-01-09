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
    product_code = Column(String(50), unique=True, nullable=False)
    product_name = Column(String(255), nullable=False)
    dosage = Column(String(100))
    form = Column(String(50))  # Tablet, Syrup, Injection, etc.
    active_ingredients = Column(ARRAY(String))
    therapeutic_category = Column(String(100))
    requires_prescription = Column(Boolean, default=True)
    description = Column(Text)
    nafdac_registration_number = Column(String(100))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    manufacturer = relationship("Manufacturer", back_populates="products")
    batches = relationship("Batch", back_populates="product")

    def __repr__(self):
        return f"<Product {self.product_name}>"
