import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Text, Date, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.db.session import Base
import enum


class BatchStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    RECALLED = "RECALLED"
    EXPIRED = "EXPIRED"


class PackStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    USED = "USED"
    RECALLED = "RECALLED"
    EXPIRED = "EXPIRED"


class Batch(Base):
    __tablename__ = "batches"

    batch_id = Column(String(50), primary_key=True)  # Format: PFZ-AMOX500-20260103-00001
    product_id = Column(UUID(as_uuid=True), ForeignKey("products.product_id"), nullable=False)
    manufacturer_id = Column(UUID(as_uuid=True), ForeignKey("manufacturers.manufacturer_id"), nullable=False)
    production_date = Column(Date, nullable=False)
    expiry_date = Column(Date, nullable=False)
    batch_size = Column(Integer, nullable=False)
    number_of_cartons = Column(Integer)
    total_packs = Column(Integer)
    quality_certificate_url = Column(Text)
    status = Column(SQLEnum(BatchStatus), default=BatchStatus.ACTIVE)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.user_id"))
    blockchain_tx_id = Column(String(255))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    product = relationship("Product", back_populates="batches")
    cartons = relationship("Carton", back_populates="batch")
    packs = relationship("Pack", back_populates="batch")


class Carton(Base):
    __tablename__ = "cartons"

    carton_id = Column(String(50), primary_key=True)  # Format: BATCH_ID-C-0042
    batch_id = Column(String(50), ForeignKey("batches.batch_id"), nullable=False)
    carton_number = Column(Integer, nullable=False)
    packs_per_carton = Column(Integer, nullable=False)
    current_location = Column(String(255))
    current_holder_id = Column(UUID(as_uuid=True), ForeignKey("organizations.organization_id"))
    blockchain_tx_id = Column(String(255))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    batch = relationship("Batch", back_populates="cartons")
    packs = relationship("Pack", back_populates="carton")


class Pack(Base):
    __tablename__ = "packs"

    pack_id = Column(String(16), primary_key=True)  # Format: AX7K9M2P5N8Q3R1T
    batch_id = Column(String(50), ForeignKey("batches.batch_id"), nullable=False)
    carton_id = Column(String(50), ForeignKey("cartons.carton_id"))
    qr_code_url = Column(Text)
    barcode = Column(String(50))
    status = Column(SQLEnum(PackStatus), default=PackStatus.ACTIVE)
    blockchain_tx_id = Column(String(255))
    verification_count = Column(Integer, default=0)
    first_verified_at = Column(DateTime)
    last_verified_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    batch = relationship("Batch", back_populates="packs")
    carton = relationship("Carton", back_populates="packs")

    def __repr__(self):
        return f"<Pack {self.pack_id} - {self.status.value}>"
