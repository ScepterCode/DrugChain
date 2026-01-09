import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, Integer, ForeignKey, Enum as SQLEnum, ARRAY, Date, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.db.session import Base
import enum


class OrganizationType(str, enum.Enum):
    MANUFACTURER = "MANUFACTURER"
    DISTRIBUTOR = "DISTRIBUTOR"
    PHARMACY = "PHARMACY"
    REGULATOR = "REGULATOR"


class LicenseStatus(str, enum.Enum):
    PENDING = "PENDING"
    ACTIVE = "ACTIVE"
    SUSPENDED = "SUSPENDED"
    REVOKED = "REVOKED"


class Organization(Base):
    __tablename__ = "organizations"

    organization_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_name = Column(String(255), nullable=False)
    organization_type = Column(SQLEnum(OrganizationType), nullable=False)
    registration_number = Column(String(100), unique=True)
    address = Column(Text)
    city = Column(String(100))
    state = Column(String(100))
    country = Column(String(100), default="Nigeria")
    contact_email = Column(String(255))
    contact_phone = Column(String(20))
    license_status = Column(SQLEnum(LicenseStatus), default=LicenseStatus.PENDING)
    verified_by_regulator = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    users = relationship("User", back_populates="organization")
    manufacturer = relationship("Manufacturer", back_populates="organization", uselist=False)


class Manufacturer(Base):
    __tablename__ = "manufacturers"

    manufacturer_id = Column(UUID(as_uuid=True), ForeignKey("organizations.organization_id"), primary_key=True)
    manufacturer_code = Column(String(10), unique=True, nullable=False)
    nafdac_license_number = Column(String(100))
    production_capacity = Column(Integer)
    specialization = Column(ARRAY(String))
    gmp_certified = Column(Boolean, default=False)
    gmp_certificate_expiry = Column(Date)

    # Relationships
    organization = relationship("Organization", back_populates="manufacturer")
    products = relationship("Product", back_populates="manufacturer")
