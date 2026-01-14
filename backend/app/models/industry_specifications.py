import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Boolean, DateTime, ForeignKey, DECIMAL
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from app.db.session import Base


class ElectronicsSpecification(Base):
    __tablename__ = "electronics_specifications"

    spec_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    product_id = Column(UUID(as_uuid=True), ForeignKey("products.product_id", ondelete="CASCADE"), nullable=False)
    processor = Column(String(200))
    memory_gb = Column(Integer)
    storage_gb = Column(Integer)
    display_size = Column(DECIMAL(4,2))
    battery_capacity = Column(Integer)
    operating_system = Column(String(100))
    connectivity = Column(JSONB, default={})  # wifi, bluetooth, cellular, etc.
    dimensions = Column(JSONB, default={})  # length, width, height, weight
    power_requirements = Column(JSONB, default={})
    compatibility_matrix = Column(JSONB, default={})
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    product = relationship("Product", back_populates="electronics_spec")

    def __repr__(self):
        return f"<ElectronicsSpecification {self.product_id}>"


class LuxurySpecification(Base):
    __tablename__ = "luxury_specifications"

    spec_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    product_id = Column(UUID(as_uuid=True), ForeignKey("products.product_id", ondelete="CASCADE"), nullable=False)
    material = Column(String(200))
    craftsmanship_level = Column(String(50))
    limited_edition = Column(Boolean, default=False)
    edition_number = Column(Integer)
    total_edition_size = Column(Integer)
    designer = Column(String(200))
    collection_name = Column(String(200))
    authentication_features = Column(JSONB, default={})
    provenance_history = Column(JSONB, default={})
    estimated_value = Column(DECIMAL(12,2))
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    product = relationship("Product", back_populates="luxury_spec")

    def __repr__(self):
        return f"<LuxurySpecification {self.product_id}>"


class FoodSpecification(Base):
    __tablename__ = "food_specifications"

    spec_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    product_id = Column(UUID(as_uuid=True), ForeignKey("products.product_id", ondelete="CASCADE"), nullable=False)
    nutritional_info = Column(JSONB, default={})
    allergens = Column(JSONB, default=[])  # Array of allergen strings
    dietary_restrictions = Column(JSONB, default=[])  # vegan, gluten-free, kosher, halal
    origin_location = Column(String(200))
    harvest_date = Column(DateTime)
    processing_date = Column(DateTime)
    storage_requirements = Column(JSONB, default={})
    shelf_life_days = Column(Integer)
    organic_certified = Column(Boolean, default=False)
    fair_trade_certified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    product = relationship("Product", back_populates="food_spec")

    def __repr__(self):
        return f"<FoodSpecification {self.product_id}>"


class AutomotiveSpecification(Base):
    __tablename__ = "automotive_specifications"

    spec_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    product_id = Column(UUID(as_uuid=True), ForeignKey("products.product_id", ondelete="CASCADE"), nullable=False)
    part_category = Column(String(100))  # engine, brake, electrical, body, etc.
    oem_part_number = Column(String(100))
    compatible_vehicles = Column(JSONB, default={})  # make, model, year ranges
    safety_critical = Column(Boolean, default=False)
    installation_complexity = Column(String(20), default="medium")
    warranty_terms = Column(JSONB, default={})
    recall_history = Column(JSONB, default={})
    performance_specs = Column(JSONB, default={})
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    product = relationship("Product", back_populates="automotive_spec")

    def __repr__(self):
        return f"<AutomotiveSpecification {self.product_id}>"


class CosmeticsSpecification(Base):
    __tablename__ = "cosmetics_specifications"

    spec_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    product_id = Column(UUID(as_uuid=True), ForeignKey("products.product_id", ondelete="CASCADE"), nullable=False)
    ingredients = Column(JSONB, default={})
    skin_type_suitability = Column(JSONB, default=[])  # Array of skin types
    usage_instructions = Column(String(1000))
    safety_warnings = Column(String(1000))
    dermatologically_tested = Column(Boolean, default=False)
    cruelty_free = Column(Boolean, default=False)
    natural_percentage = Column(DECIMAL(5,2))
    spf_rating = Column(Integer)
    color_shade = Column(String(100))
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    product = relationship("Product", back_populates="cosmetics_spec")

    def __repr__(self):
        return f"<CosmeticsSpecification {self.product_id}>"