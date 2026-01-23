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
        from app.services.supabase_auth_service import supabase_auth
        
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
            
            # Create user (not verified until email is confirmed)
            new_user = User(
                email=user_data.email,
                password_hash=get_password_hash(user_data.password),
                full_name=user_data.full_name,
                phone_number=user_data.phone_number,
                role=user_role,
                organization_id=organization.organization_id if organization else None,
                is_verified=False  # Will be verified via Supabase email
            )
            
            db.add(new_user)
            db.commit()
            db.refresh(new_user)
            
            # Send verification email via Supabase
            try:
                await supabase_auth.send_verification_email(new_user.email)
            except Exception as e:
                # Log but don't fail registration if email fails
                print(f"Email verification send failed: {e}")
            
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
                "token_type": "bearer",
                "message": "Registration successful. Please check your email to verify your account."
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
        """Authenticate user by email and password"""
        # NOTE: Account lockout temporarily disabled until database columns are added
        from datetime import datetime
        
        user = db.query(User).filter(User.email == email).first()
        
        if not user:
            return None
        
        # Verify password
        if not verify_password(password, user.password_hash):
            return None
        
        # Update last login
        user.last_login = datetime.utcnow()
        db.commit()
        
        return user
    
    @staticmethod
    async def get_user_by_id(db: Session, user_id: str) -> Optional[User]:
        """Get user by ID"""
        return db.query(User).filter(User.user_id == user_id).first()
