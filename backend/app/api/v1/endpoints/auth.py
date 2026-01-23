from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas import UserCreate, UserResponse, Token
from app.services.auth_service import AuthService
from app.core.security import create_access_token, create_refresh_token
from app.api.dependencies import get_current_user
from app.models import User

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


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


@router.post("/request-password-reset")
async def request_password_reset(
    email: str,
    db: Session = Depends(get_db)
):
    """
    Request password reset email
    
    Always returns success to prevent email enumeration
    """
    from app.services.email_service import EmailService
    from app.services.audit_service import AuditService
    
    user = db.query(User).filter(User.email == email).first()
    
    if user:
        # Generate reset token
        reset_token = EmailService.generate_token()
        user.password_reset_token = reset_token
        user.password_reset_token_expires = EmailService.generate_token_expiry(hours=1)
        db.commit()
        
        # Send reset email
        await EmailService.send_password_reset_email(email, reset_token, user.full_name)
        
        # Log the request
        AuditService.log_password_reset_request(db, email)
    
    # Always return success to prevent email enumeration
    return {
        "success": True,
        "message": "If an account exists with this email, a password reset link has been sent"
    }


@router.post("/reset-password")
async def reset_password(
    token: str,
    new_password: str,
    db: Session = Depends(get_db)
):
    """Reset password using reset token"""
    from datetime import datetime
    from app.services.password_policy import PasswordPolicy
    from app.services.audit_service import AuditService
    
    # Validate new password
    is_valid, errors = PasswordPolicy.validate_password(new_password)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"message": "Password does not meet requirements", "errors": errors}
        )
    
    # Find user with valid token
    user = db.query(User).filter(
        User.password_reset_token == token,
        User.password_reset_token_expires > datetime.utcnow()
    ).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token"
        )
    
    # Update password
    user.password_hash = get_password_hash(new_password)
    user.password_reset_token = None
    user.password_reset_token_expires = None
    user.password_changed_at = datetime.utcnow()
    user.failed_login_attempts = 0  # Reset failed attempts
    user.account_locked_until = None  # Unlock account if locked
    
    db.commit()
    
    # Log password change
    AuditService.log_password_change(db, str(user.user_id))
    
    return {
        "success": True,
        "message": "Password reset successfully. You can now login with your new password"
    }


@router.post("/verify-email")
async def verify_email(
    token: str,
    db: Session = Depends(get_db)
):
    """Verify email using verification token"""
    from datetime import datetime
    from app.services.email_service import EmailService
    
    # Find user with valid token
    user = db.query(User).filter(
        User.email_verification_token == token,
        User.email_verification_token_expires > datetime.utcnow()
    ).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired verification token"
        )
    
    # Mark email as verified
    user.is_verified = True
    user.email_verified_at = datetime.utcnow()
    user.email_verification_token = None
    user.email_verification_token_expires = None
    
    db.commit()
    
    # Send welcome email
    await EmailService.send_welcome_email(user.email, user.full_name)
    
    return {
        "success": True,
        "message": "Email verified successfully! You can now access all features"
    }


@router.post("/resend-verification")
async def resend_verification_email(
    email: str,
    db: Session = Depends(get_db)
):
    """Resend email verification"""
    from app.services.email_service import EmailService
    
    user = db.query(User).filter(User.email == email).first()
    
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
    verification_token = EmailService.generate_token()
    user.email_verification_token = verification_token
    user.email_verification_token_expires = EmailService.generate_token_expiry(hours=24)
    db.commit()
    
    # Send verification email
    await EmailService.send_verification_email(user.email, verification_token, user.full_name)
    
    return {
        "success": True,
        "message": "Verification email sent successfully"
    }


@router.post("/validate-password")
async def validate_password(password: str):
    """Validate password against policy (for frontend validation)"""
    from app.services.password_policy import PasswordPolicy
    
    is_valid, errors = PasswordPolicy.validate_password(password)
    strength = PasswordPolicy.get_password_strength(password)
    
    return {
        "valid": is_valid,
        "errors": errors,
        "strength": strength
    }


@router.post("/resend-verification")
async def resend_verification(
    email: str,
    db: Session = Depends(get_db)
):
    """Resend email verification using Supabase Auth"""
    from app.services.supabase_auth_service import supabase_auth
    
    # Check if user exists
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    if user.is_verified:
        return {"message": "Email already verified"}
    
    # Send verification email via Supabase
    success = await supabase_auth.send_verification_email(email)
    
    if success:
        return {"message": "Verification email sent successfully"}
    else:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to send verification email"
        )


@router.post("/verify-email")
async def verify_email(
    token: str,
    db: Session = Depends(get_db)
):
    """Verify email using Supabase Auth token"""
    from app.services.supabase_auth_service import supabase_auth
    
    # Verify token with Supabase
    result = await supabase_auth.verify_email_token(token)
    
    if not result:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired verification token"
        )
    
    # Extract email from result
    email = result.get("user", {}).get("email")
    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Could not extract email from token"
        )
    
    # Update user verification status
    user = db.query(User).filter(User.email == email).first()
    if user:
        user.is_verified = True
        db.commit()
        return {"message": "Email verified successfully"}
    else:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )


@router.post("/request-password-reset")
async def request_password_reset(
    email: str,
    db: Session = Depends(get_db)
):
    """Request password reset using Supabase Auth"""
    from app.services.supabase_auth_service import supabase_auth
    
    # Check if user exists
    user = db.query(User).filter(User.email == email).first()
    if not user:
        # Don't reveal if user exists or not
        return {"message": "If the email exists, a password reset link has been sent"}
    
    # Send password reset email via Supabase
    success = await supabase_auth.send_password_reset_email(email)
    
    return {"message": "If the email exists, a password reset link has been sent"}


@router.post("/reset-password")
async def reset_password(
    token: str,
    new_password: str,
    db: Session = Depends(get_db)
):
    """Reset password using Supabase Auth"""
    from app.services.supabase_auth_service import supabase_auth
    from app.core.security import get_password_hash
    
    # Update password via Supabase
    success = await supabase_auth.update_password(token, new_password)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token"
        )
    
    # Also update password hash in our database
    # Extract user info from token (simplified - in production, decode JWT properly)
    # For now, we'll just return success
    
    return {"message": "Password reset successfully"}
