import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Text, Numeric
from sqlalchemy.dialects.postgresql import UUID
from app.db.session import Base

class VerificationEvent(Base):
    __tablename__ = "verification_events"

    event_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    pack_id = Column(String(16), ForeignKey("packs.pack_id"), nullable=False)
    verified_by_phone = Column(String(20))
    verified_by_user_id = Column(UUID(as_uuid=True), ForeignKey("users.user_id"))
    verification_result = Column(String(50), default="GENUINE") # GENUINE, COUNTERFEIT, SUSPICIOUS, INVALID, EXPIRED
    location_latitude = Column(Numeric(10, 8))
    location_longitude = Column(Numeric(11, 8))
    location_address = Column(Text)
    device_info = Column(Text)
    ip_address = Column(String(50))
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Add computed properties for analytics compatibility
    @property
    def verification_id(self):
        return self.event_id
    
    @property
    def location_city(self):
        # Extract city from location_address if available
        if self.location_address:
            parts = self.location_address.split(',')
            return parts[0].strip() if parts else None
        return None
    
    @property
    def location_state(self):
        # Extract state from location_address if available
        if self.location_address:
            parts = self.location_address.split(',')
            return parts[-1].strip() if len(parts) > 1 else None
        return None
