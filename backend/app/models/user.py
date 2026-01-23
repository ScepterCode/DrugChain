import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Integer, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship, deferred
from app.db.session import Base
import enum


class UserRole(str, enum.Enum):
    MANUFACTURER = "MANUFACTURER"
    DISTRIBUTOR = "DISTRIBUTOR"
    RETAILER = "RETAILER"
    REGULATOR = "REGULATOR"
    SYSTEM_ADMIN = "SYSTEM_ADMIN"


class User(Base):
    __tablename__ = "users"

    user_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    phone_number = Column(String(20))
    role = Column(SQLEnum(UserRole), nullable=False)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.organization_id", ondelete="CASCADE"))
    
    # Email verification
    is_verified = Column(Boolean, default=False)
    email_verified_at = Column(DateTime)
    email_verification_token = deferred(Column(String(255)))
    email_verification_token_expires = deferred(Column(DateTime))
    
    # Password reset
    password_reset_token = deferred(Column(String(255)))
    password_reset_token_expires = deferred(Column(DateTime))
    password_changed_at = deferred(Column(DateTime))
    
    # Account security
    two_factor_enabled = Column(Boolean, default=False)
    two_factor_secret = Column(String(255))  # Encrypted TOTP secret
    failed_login_attempts = deferred(Column(Integer, default=0))
    account_locked_until = deferred(Column(DateTime))
    
    # Timestamps
    last_login = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    organization = relationship("Organization", back_populates="users")

    def __repr__(self):
        return f"<User {self.email}>"
