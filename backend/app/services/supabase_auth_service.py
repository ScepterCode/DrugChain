"""
Supabase Auth Integration Service
Handles email verification using Supabase's built-in auth system
"""
from supabase import create_client, Client
from app.core.config import settings
from typing import Optional, Dict
import logging

logger = logging.getLogger(__name__)


class SupabaseAuthService:
    """Service for Supabase Auth operations"""
    
    def __init__(self):
        """Initialize Supabase client"""
        try:
            self.client: Client = create_client(
                settings.SUPABASE_URL,
                settings.SUPABASE_SERVICE_KEY or settings.SUPABASE_KEY
            )
        except Exception as e:
            logger.warning(f"Supabase client initialization failed: {e}")
            self.client = None
    
    async def send_verification_email(self, email: str) -> bool:
        """
        Send verification email using Supabase Auth
        
        Args:
            email: User's email address
            
        Returns:
            bool: True if email sent successfully
        """
        if not self.client:
            logger.warning("Supabase client not initialized")
            return False
        
        try:
            # Supabase automatically sends verification email on signup
            # This method can be used to resend verification
            response = self.client.auth.resend(
                type="signup",
                email=email
            )
            logger.info(f"Verification email sent to {email}")
            return True
        except Exception as e:
            logger.error(f"Failed to send verification email: {e}")
            return False
    
    async def verify_email_token(self, token: str) -> Optional[Dict]:
        """
        Verify email token from Supabase
        
        Args:
            token: Verification token from email link
            
        Returns:
            Dict with user info if successful, None otherwise
        """
        if not self.client:
            return None
        
        try:
            response = self.client.auth.verify_otp(
                token_hash=token,
                type="email"
            )
            return response
        except Exception as e:
            logger.error(f"Email verification failed: {e}")
            return None
    
    async def send_password_reset_email(self, email: str) -> bool:
        """
        Send password reset email using Supabase Auth
        
        Args:
            email: User's email address
            
        Returns:
            bool: True if email sent successfully
        """
        if not self.client:
            return False
        
        try:
            response = self.client.auth.reset_password_email(email)
            logger.info(f"Password reset email sent to {email}")
            return True
        except Exception as e:
            logger.error(f"Failed to send password reset email: {e}")
            return False
    
    async def update_password(self, access_token: str, new_password: str) -> bool:
        """
        Update user password using Supabase Auth
        
        Args:
            access_token: User's access token
            new_password: New password
            
        Returns:
            bool: True if password updated successfully
        """
        if not self.client:
            return False
        
        try:
            response = self.client.auth.update_user(
                access_token,
                {"password": new_password}
            )
            logger.info("Password updated successfully")
            return True
        except Exception as e:
            logger.error(f"Failed to update password: {e}")
            return False


# Singleton instance
supabase_auth = SupabaseAuthService()
