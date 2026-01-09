from pydantic import BaseModel
from typing import Optional
from datetime import datetime


# Verification Schemas
class VerificationRequest(BaseModel):
    pack_id: str
    verification_method: str = "QR_SCAN"
    location: Optional[str] = None
    phone_number: Optional[str] = None
    device_info: Optional[dict] = None


class CartonVerificationRequest(BaseModel):
    carton_id: str
    verification_method: str = "QR_SCAN"
    location: Optional[str] = None
    phone_number: Optional[str] = None
    device_info: Optional[dict] = None


class VerificationResponse(BaseModel):
    success: bool
    verification_result: str  # GENUINE, COUNTERFEIT, INVALID, EXPIRED, SUSPICIOUS
    message: str
    data: Optional[dict] = None


# SMS Verification Schema
class SMSVerificationRequest(BaseModel):
    phone_number: str
    pack_id: str


class SMSVerificationResponse(BaseModel):
    success: bool
    message: str
    sms_sent_to: str
    verification_result: str
