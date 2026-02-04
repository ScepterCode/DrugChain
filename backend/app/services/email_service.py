from typing import Optional
import secrets
from datetime import datetime, timedelta, timezone


class EmailService:
    """
    Email service for sending verification and password reset emails
    
    NOTE: This is a placeholder implementation. In production, integrate with:
    - SendGrid
    - AWS SES
    - Mailgun
    - SMTP server
    """
    
    @staticmethod
    def generate_token() -> str:
        """Generate a secure random token"""
        return secrets.token_urlsafe(32)
    
    @staticmethod
    def generate_token_expiry(hours: int = 24) -> datetime:
        """Generate token expiry time"""
        return datetime.now(timezone.utc) + timedelta(hours=hours)
    
    @staticmethod
    async def send_verification_email(email: str, token: str, full_name: str) -> bool:
        """
        Send email verification email
        
        Args:
            email: Recipient email
            token: Verification token
            full_name: User's full name
        
        Returns:
            True if sent successfully
        """
        # TODO: Implement actual email sending
        # For now, just log the verification link
        verification_link = f"https://pack-guard.vercel.app/verify-email?token={token}"
        
        print(f"""
        ========================================
        EMAIL VERIFICATION
        ========================================
        To: {email}
        Subject: Verify your PackGuard account
        
        Hi {full_name},
        
        Thank you for registering with PackGuard!
        
        Please verify your email address by clicking the link below:
        {verification_link}
        
        This link will expire in 24 hours.
        
        If you didn't create this account, please ignore this email.
        
        Best regards,
        PackGuard Team
        ========================================
        """)
        
        return True
    
    @staticmethod
    async def send_password_reset_email(email: str, token: str, full_name: str) -> bool:
        """
        Send password reset email
        
        Args:
            email: Recipient email
            token: Reset token
            full_name: User's full name
        
        Returns:
            True if sent successfully
        """
        # TODO: Implement actual email sending
        reset_link = f"https://pack-guard.vercel.app/reset-password?token={token}"
        
        print(f"""
        ========================================
        PASSWORD RESET
        ========================================
        To: {email}
        Subject: Reset your PackGuard password
        
        Hi {full_name},
        
        We received a request to reset your password.
        
        Click the link below to reset your password:
        {reset_link}
        
        This link will expire in 1 hour.
        
        If you didn't request this, please ignore this email and your password will remain unchanged.
        
        Best regards,
        PackGuard Team
        ========================================
        """)
        
        return True
    
    @staticmethod
    async def send_welcome_email(email: str, full_name: str) -> bool:
        """Send welcome email after email verification"""
        print(f"""
        ========================================
        WELCOME EMAIL
        ========================================
        To: {email}
        Subject: Welcome to PackGuard!
        
        Hi {full_name},
        
        Your email has been verified successfully!
        
        You can now access all features of PackGuard:
        - Product verification
        - Batch management
        - Supply chain tracking
        - Analytics and reporting
        
        Get started: https://pack-guard.vercel.app/portal/dashboard
        
        Best regards,
        PackGuard Team
        ========================================
        """)
        
        return True
    
    @staticmethod
    async def send_account_locked_email(email: str, full_name: str, unlock_time: datetime) -> bool:
        """Send email when account is locked"""
        print(f"""
        ========================================
        ACCOUNT LOCKED
        ========================================
        To: {email}
        Subject: Your PackGuard account has been locked
        
        Hi {full_name},
        
        Your account has been temporarily locked due to multiple failed login attempts.
        
        Your account will be automatically unlocked at: {unlock_time.strftime('%Y-%m-%d %H:%M:%S UTC')}
        
        If this wasn't you, please contact support immediately.
        
        Best regards,
        PackGuard Team
        ========================================
        """)
        
        return True
