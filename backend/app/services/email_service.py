from typing import Optional
import secrets
from datetime import datetime, timedelta, timezone
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)


class EmailService:
    """
    Email service using Supabase Auth for email delivery
    
    Supabase handles all email sending automatically:
    - Email verification
    - Password reset
    - Magic links
    
    No SMTP configuration needed!
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
        
        NOTE: Supabase Auth handles this automatically when you call:
        supabase.auth.sign_up() with email_confirm=True
        
        This method is kept for compatibility but Supabase does the actual sending.
        
        Args:
            email: Recipient email
            token: Verification token (not used - Supabase generates its own)
            full_name: User's full name
        
        Returns:
            True (Supabase handles the sending)
        """
        logger.info(f"""
        ========================================
        EMAIL VERIFICATION (Handled by Supabase)
        ========================================
        To: {email}
        Name: {full_name}
        
        Supabase Auth will automatically send the verification email.
        No action needed from this service.
        
        User will receive:
        - Professional email from Supabase
        - Verification link
        - Branded with your project settings
        
        Configure email templates in Supabase Dashboard:
        Authentication → Email Templates
        ========================================
        """)
        
        return True
    
    @staticmethod
    async def send_password_reset_email(email: str, token: str, full_name: str) -> bool:
        """
        Send password reset email
        
        NOTE: Supabase Auth handles this automatically when you call:
        supabase.auth.reset_password_for_email()
        
        This method is kept for compatibility but Supabase does the actual sending.
        
        Args:
            email: Recipient email
            token: Reset token (not used - Supabase generates its own)
            full_name: User's full name
        
        Returns:
            True (Supabase handles the sending)
        """
        logger.info(f"""
        ========================================
        PASSWORD RESET (Handled by Supabase)
        ========================================
        To: {email}
        Name: {full_name}
        
        Supabase Auth will automatically send the password reset email.
        No action needed from this service.
        
        User will receive:
        - Professional email from Supabase
        - Password reset link
        - Branded with your project settings
        
        Configure email templates in Supabase Dashboard:
        Authentication → Email Templates
        ========================================
        """)
        
        return True
    
    @staticmethod
    async def send_welcome_email(email: str, full_name: str) -> bool:
        """
        Send welcome email after email verification
        
        NOTE: This can be configured in Supabase as a custom email template
        or handled via database triggers/webhooks.
        
        For now, we'll log it. You can customize the "Confirm signup" template
        in Supabase to include welcome messaging.
        
        Args:
            email: Recipient email
            full_name: User's full name
        
        Returns:
            True
        """
        logger.info(f"""
        ========================================
        WELCOME EMAIL
        ========================================
        To: {email}
        Name: {full_name}
        
        Welcome message can be added to Supabase's "Confirm signup" template.
        
        To customize:
        1. Go to Supabase Dashboard
        2. Authentication → Email Templates
        3. Edit "Confirm signup" template
        4. Add welcome message and feature list
        ========================================
        """)
        
        return True
    
    @staticmethod
    async def send_account_locked_email(email: str, full_name: str, unlock_time: datetime) -> bool:
        """
        Send email when account is locked
        
        NOTE: This is a custom email that Supabase doesn't handle automatically.
        For production, you can:
        1. Use Supabase Edge Functions to send custom emails
        2. Use a simple email service like Resend (https://resend.com)
        3. Keep it as a log for now
        
        Args:
            email: Recipient email
            full_name: User's full name
            unlock_time: When account will be unlocked
        
        Returns:
            True
        """
        logger.info(f"""
        ========================================
        ACCOUNT LOCKED NOTIFICATION
        ========================================
        To: {email}
        Name: {full_name}
        Unlock Time: {unlock_time.strftime('%Y-%m-%d %H:%M:%S UTC')}
        
        Account locked due to multiple failed login attempts.
        
        For production, consider:
        - Supabase Edge Functions for custom emails
        - Resend.com (simple, affordable email API)
        - SendGrid/Mailgun for enterprise needs
        
        For now, user will see the lock message in the UI.
        ========================================
        """)
        
        return True
