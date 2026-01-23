from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException, status
from app.models import User, Organization, Manufacturer, UserRole, OrganizationType
from app.schemas import UserCreate, UserResponse
from app.core.security import get_password_hash, verify_password, create_access_token, create_refresh_token
from typing import Optional
import uuid


class AuthService:
    """Service for authentication operations"""
    
    @staticmethod
    async def register_user(db: Session, user_data: UserCreate) -> dict:
        """Register a new user with organization"""
        from app.services.password_policy import PasswordPolicy
        from app.services.email_service import EmailService
        from app.services.audit_service import AuditService
        
        # Validate password
        is_valid, errors = PasswordPolicy.validate_password(user_data.password)
        if not is_valid:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={"message": "Password does not meet requirements", "errors": errors}
            )
        
        # Check if user already exists
        existing_user = db.query(User).filter(User.email == user_data.email).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email already registered"
            )
        
        try:
            # Create organization if provided
            organization = None
            if user_data.organization_name and user_data.organization_type:
                # Map role to organization type
                try:
                    org_type = OrganizationType[user_data.organization_type]
                except KeyError:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"Invalid organization type: {user_data.organization_type}"
                    )
                
                organization = Organization(
                    organization_name=user_data.organization_name,
                    organization_type=org_type,
                    registration_number=user_data.registration_number,
                    contact_email=user_data.email,
                    contact_phone=user_data.phone_number
                )
                db.add(organization)
                db.flush()  # Get organization_id
                
                # Create manufacturer record if organization is manufacturer
                if org_type == OrganizationType.MANUFACTURER:
                    # Generate manufacturer code (first 3 letters of org name + random)
                    code_prefix = user_data.organization_name[:3].upper()
                    manufacturer_code = f"{code_prefix}{str(uuid.uuid4())[:4].upper()}"
                    
                    manufacturer = Manufacturer(
                        manufacturer_id=organization.organization_id,
                        manufacturer_code=manufacturer_code,
                        gmp_certified=False
                    )
                    db.add(manufacturer)
            elif user_data.role != 'REGULATOR' and not user_data.organization_name:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Organization name is required for this role"
                )
            
            # Validate role
            try:
                user_role = UserRole[user_data.role]
            except KeyError:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid role: {user_data.role}"
                )
            
            # Generate email verification token
            verification_token = EmailService.generate_token()
            
            # Create user
            new_user = User(
                email=user_data.email,
                password_hash=get_password_hash(user_data.password),
                full_name=user_data.full_name,
                phone_number=user_data.phone_number,
                role=user_role,
                organization_id=organization.organization_id if organization else None,
                is_verified=False,
                email_verification_token=verification_token,
                email_verification_token_expires=EmailService.generate_token_expiry(hours=24)
            )
            
            db.add(new_user)
            db.commit()
            db.refresh(new_user)
            
            # Send verification email
            await EmailService.send_verification_email(
                new_user.email, 
                verification_token, 
                new_user.full_name
            )
            
            # Log registration
            AuditService.log_registration(
                db, 
                str(new_user.user_id), 
                new_user.email, 
                new_user.role.value
            )
            
            # Generate tokens
            access_token = create_access_token(
                data={
                    "sub": str(new_user.user_id),
                    "role": new_user.role.value,
                    "org_id": str(new_user.organization_id) if new_user.organization_id else None
                }
            )
            refresh_token = create_refresh_token(
                data={"sub": str(new_user.user_id)}
            )
            
            return {
                "user": UserResponse.from_orm(new_user),
                "access_token": access_token,
                "refresh_token": refresh_token,
                "token_type": "bearer"
            }
            
        except IntegrityError as e:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Database integrity error: {str(e)}"
            )
        except Exception as e:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Registration failed: {str(e)}"
            )
    
    @staticmethod
    async def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
        """Authenticate user by email and password with account lockout"""
        from datetime import datetime, timedelta
        from app.services.audit_service import AuditService
        from app.services.email_service import EmailService
        
        user = db.query(User).filter(User.email == email).first()
        
        if not user:
            # Log failed attempt
            AuditService.log_login_attempt(db, email, False, failure_reason="User not found")
            return None
        
        # Check if account is locked
        if user.account_locked_until and user.account_locked_until > datetime.utcnow():
            AuditService.log_login_attempt(db, email, False, failure_reason="Account locked")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Account is locked until {user.account_locked_until.strftime('%Y-%m-%d %H:%M:%S UTC')}. Please try again later or reset your password."
            )
        
        # Verify password
        if not verify_password(password, user.password_hash):
            # Increment failed attempts
            user.failed_login_attempts += 1
            
            # Lock account after 5 failed attempts
            if user.failed_login_attempts >= 5:
                user.account_locked_until = datetime.utcnow() + timedelta(minutes=30)
                db.commit()
                
                # Log lockout
                AuditService.log_account_lockout(db, str(user.user_id), email)
                
                # Send lockout email
                await EmailService.send_account_locked_email(email, user.full_name, user.account_locked_until)
                
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Account locked due to too many failed login attempts. Please try again in 30 minutes or reset your password."
                )
            
            db.commit()
            
            # Log failed attempt
            AuditService.log_login_attempt(
                db, email, False, 
                failure_reason=f"Invalid password ({user.failed_login_attempts}/5 attempts)"
            )
            
            return None
        
        # Successful login - reset failed attempts
        user.failed_login_attempts = 0
        user.account_locked_until = None
        user.last_login = datetime.utcnow()
        db.commit()
        
        # Log successful login
        AuditService.log_login_attempt(db, email, True)
        
        return user
    
    @staticmethod
    async def get_user_by_id(db: Session, user_id: str) -> Optional[User]:
        """Get user by ID"""
        return db.query(User).filter(User.user_id == user_id).first()
