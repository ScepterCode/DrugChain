from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from pydantic import BaseModel
import logging

from app.db.session import get_db
from app.schemas import UserCreate, UserResponse, Token, EmailRequest
from app.services.auth_service import AuthService
from app.core.security import create_access_token, create_refresh_token, get_password_hash
from app.api.dependencies import get_current_user
from app.models import User

logger = logging.getLogger(__name__)

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


# Request models for password reset
class PasswordResetRequest(BaseModel):
    token: str
    new_password: str


@router.post("/register", response_model=dict, status_code=status.HTTP_201_CREATED)
async def register(
    user_data: UserCreate,
    db: Session = Depends(get_db)
):
    """
    Register a new user with organization.
    
    For manufacturers, an organization and manufacturer record will be created.
    Returns user details and authentication tokens.
    """
    try:
        result = await AuthService.register_user(db, user_data)
        return {
            "success": True,
            "message": "User registered successfully",
            "data": {
                "user": result["user"],
                "access_token": result["access_token"],
                "refresh_token": result["refresh_token"],
                "token_type": result["token_type"]
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Registration failed: {str(e)}"
        )


@router.post("/login", response_model=Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """
    Login with email and password.
    
    Returns JWT access and refresh tokens.
    """
    user = await AuthService.authenticate_user(db, form_data.username, form_data.password)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(
        data={
            "sub": str(user.user_id),
            "role": user.role.value,
            "org_id": str(user.organization_id) if user.organization_id else None
        }
    )
    refresh_token = create_refresh_token(
        data={"sub": str(user.user_id)}
    )
    
    return Token(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer"
    )


@router.post("/refresh-token", response_model=Token)
async def refresh_token(
    refresh_token: str,
    db: Session = Depends(get_db)
):
    """
    Refresh access token using refresh token.
    """
    from app.core.security import decode_token
    
    payload = decode_token(refresh_token)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )
    
    user_id = payload.get("sub")
    user = await AuthService.get_user_by_id(db, user_id)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    
    new_access_token = create_access_token(
        data={
            "sub": str(user.user_id),
            "role": user.role.value,
            "org_id": str(user.organization_id) if user.organization_id else None
        }
    )
    new_refresh_token = create_refresh_token(
        data={"sub": str(user.user_id)}
    )
    
    return Token(
        access_token=new_access_token,
        refresh_token=new_refresh_token,
        token_type="bearer"
    )


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: User = Depends(get_current_user)
):
    """
    Get current authenticated user information.
    """
    return UserResponse.from_orm(current_user)


@router.post("/logout")
async def logout():
    """
    Logout (client should discard tokens).
    """
    return {
        "success": True,
        "message": "Logged out successfully. Please discard your tokens."
    }


@router.post("/verify-email")
async def verify_email(
    token: str,
    db: Session = Depends(get_db)
):
    """
    Verify email using verification token.
    
    This endpoint verifies the token stored in our database (not Supabase).
    """
    from app.services.resend_email_service import ResendEmailService
    
    # Find user with valid token
    user = db.query(User).filter(
        User.email_verification_token == token,
        User.email_verification_token_expires > datetime.now(timezone.utc)
    ).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired verification token"
        )
    
    # Mark email as verified
    user.is_verified = True
    user.email_verified_at = datetime.now(timezone.utc)
    user.email_verification_token = None
    user.email_verification_token_expires = None
    
    db.commit()
    
    # Send welcome email
    try:
        await ResendEmailService.send_welcome_email(user.email, user.full_name)
    except Exception as e:
        logger.warning(f"Failed to send welcome email: {e}")
    
    return {
        "success": True,
        "message": "Email verified successfully! You can now access all features"
    }


@router.post("/resend-verification")
async def resend_verification_email(
    request: EmailRequest,
    db: Session = Depends(get_db)
):
    """
    Resend email verification.
    
    Generates a new token and sends verification email via SMTP.
    """
    from app.services.resend_email_service import ResendEmailService
    
    user = db.query(User).filter(User.email == request.email).first()
    
    if not user:
        # Don't reveal if email exists
        return {
            "success": True,
            "message": "If an account exists with this email, a verification email has been sent"
        }
    
    if user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email is already verified"
        )
    
    # Generate new token
    verification_token = ResendEmailService.generate_token()
    user.email_verification_token = verification_token
    user.email_verification_token_expires = ResendEmailService.generate_token_expiry(hours=24)
    db.commit()
    
    # Send verification email via SMTP
    try:
        email_sent = await ResendEmailService.send_verification_email(
            user.email, 
            verification_token, 
            user.full_name
        )
        if not email_sent:
            logger.error(f"Failed to send verification email to {user.email}")
    except Exception as e:
        logger.error(f"Error sending verification email: {e}")
    
    return {
        "success": True,
        "message": "Verification email sent successfully"
    }


@router.post("/request-password-reset")
async def request_password_reset(
    request: EmailRequest,
    db: Session = Depends(get_db)
):
    """
    Request password reset email.
    
    Always returns success to prevent email enumeration.
    Sends password reset email via SMTP.
    """
    from app.services.resend_email_service import ResendEmailService
    from app.services.audit_service import AuditService
    
    user = db.query(User).filter(User.email == request.email).first()
    
    if user:
        # Generate reset token
        reset_token = ResendEmailService.generate_token()
        user.password_reset_token = reset_token
        user.password_reset_token_expires = ResendEmailService.generate_token_expiry(hours=1)
        db.commit()
        
        # Send password reset email via SMTP
        try:
            email_sent = await ResendEmailService.send_password_reset_email(
                request.email, 
                reset_token, 
                user.full_name
            )
            if not email_sent:
                logger.error(f"Failed to send password reset email to {request.email}")
        except Exception as e:
            logger.error(f"Error sending password reset email: {e}")
        
        # Log the request
        try:
            AuditService.log_password_reset_request(db, request.email)
        except Exception as e:
            logger.warning(f"Failed to log password reset request: {e}")
    
    # Always return success to prevent email enumeration
    return {
        "success": True,
        "message": "If an account exists with this email, a password reset link has been sent"
    }


@router.post("/reset-password")
async def reset_password(
    request: PasswordResetRequest,
    db: Session = Depends(get_db)
):
    """
    Reset password using reset token.
    
    Validates the token and updates the password.
    """
    from app.services.password_policy import PasswordPolicy
    from app.services.audit_service import AuditService
    
    # Validate new password
    is_valid, errors = PasswordPolicy.validate_password(request.new_password)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"message": "Password does not meet requirements", "errors": errors}
        )
    
    # Find user with valid token
    user = db.query(User).filter(
        User.password_reset_token == request.token,
        User.password_reset_token_expires > datetime.now(timezone.utc)
    ).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token"
        )
    
    # Update password
    user.password_hash = get_password_hash(request.new_password)
    user.password_reset_token = None
    user.password_reset_token_expires = None
    user.password_changed_at = datetime.now(timezone.utc)
    user.failed_login_attempts = 0  # Reset failed attempts
    user.account_locked_until = None  # Unlock account if locked
    
    db.commit()
    
    # Log password change
    try:
        AuditService.log_password_change(db, str(user.user_id))
    except Exception as e:
        logger.warning(f"Failed to log password change: {e}")
    
    return {
        "success": True,
        "message": "Password reset successfully. You can now login with your new password"
    }


@router.post("/validate-password")
async def validate_password(password: str):
    """
    Validate password against policy (for frontend validation).
    """
    from app.services.password_policy import PasswordPolicy
    
    is_valid, errors = PasswordPolicy.validate_password(password)
    strength = PasswordPolicy.get_password_strength(password)
    
    return {
        "valid": is_valid,
        "errors": errors,
        "strength": strength
    }
