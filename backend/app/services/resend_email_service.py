"""
Resend Email Service - HTTP API based email sending
Uses Resend's HTTP API which works reliably on cloud platforms like Render.
"""
import logging
import secrets
import httpx
import asyncio
from datetime import datetime, timedelta, timezone
from typing import Optional

from app.core.config import settings

logger = logging.getLogger(__name__)


class ResendEmailService:
    """
    Email service using Resend's HTTP API.
    Much more reliable than SMTP on cloud platforms.
    """
    
    API_URL = "https://api.resend.com/emails"
    FRONTEND_URL = getattr(settings, 'FRONTEND_URL', 'https://packguard.org')
    
    @staticmethod
    def generate_token() -> str:
        """Generate a secure random token"""
        return secrets.token_urlsafe(32)
    
    @staticmethod
    def generate_token_expiry(hours: int = 24) -> datetime:
        """Generate token expiry time"""
        return datetime.now(timezone.utc) + timedelta(hours=hours)
    
    @staticmethod
    def _get_api_key() -> Optional[str]:
        """Get Resend API key from settings"""
        return getattr(settings, 'RESEND_API_KEY', None) or None
    
    @staticmethod
    def _get_from_email() -> str:
        """Get the 'from' email address"""
        # Use configured from email, or Resend's test email for development
        from_email = getattr(settings, 'MAIL_FROM', 'onboarding@resend.dev')
        from_name = getattr(settings, 'MAIL_FROM_NAME', 'PackGuard')
        return f"{from_name} <{from_email}>"
    
    @staticmethod
    async def send_verification_email(email: str, token: str, full_name: str) -> bool:
        """Send email verification email"""
        verification_url = f"{ResendEmailService.FRONTEND_URL}/verify-email?token={token}"
        
        subject = "Verify Your PackGuard Account"
        html_body = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }}
                .content {{ background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }}
                .button {{ display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }}
                .footer {{ text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Welcome to PackGuard!</h1>
                </div>
                <div class="content">
                    <p>Hi {full_name},</p>
                    <p>Thank you for registering with PackGuard. Please verify your email address by clicking the button below:</p>
                    <p style="text-align: center;">
                        <a href="{verification_url}" class="button">Verify Email Address</a>
                    </p>
                    <p>Or copy and paste this link into your browser:</p>
                    <p style="word-break: break-all; color: #667eea;">{verification_url}</p>
                    <p>This link will expire in 24 hours.</p>
                    <p>If you didn't create an account with PackGuard, please ignore this email.</p>
                </div>
                <div class="footer">
                    <p>&copy; 2026 PackGuard. All rights reserved.</p>
                    <p>Product Authentication & Supply Chain Verification</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        return await ResendEmailService._send_email(email, subject, html_body, "verification")
    
    @staticmethod
    async def send_password_reset_email(email: str, token: str, full_name: str) -> bool:
        """Send password reset email"""
        reset_url = f"{ResendEmailService.FRONTEND_URL}/reset-password?token={token}"
        
        subject = "Reset Your PackGuard Password"
        html_body = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }}
                .content {{ background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }}
                .button {{ display: inline-block; background: #ef4444; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }}
                .footer {{ text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }}
                .warning {{ background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 6px; margin: 15px 0; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Password Reset Request</h1>
                </div>
                <div class="content">
                    <p>Hi {full_name},</p>
                    <p>We received a request to reset your PackGuard password. Click the button below to set a new password:</p>
                    <p style="text-align: center;">
                        <a href="{reset_url}" class="button">Reset Password</a>
                    </p>
                    <p>Or copy and paste this link into your browser:</p>
                    <p style="word-break: break-all; color: #ef4444;">{reset_url}</p>
                    <div class="warning">
                        <strong>⚠️ Security Notice:</strong> This link will expire in 1 hour. If you didn't request a password reset, please ignore this email and your password will remain unchanged.
                    </div>
                </div>
                <div class="footer">
                    <p>&copy; 2026 PackGuard. All rights reserved.</p>
                    <p>Product Authentication & Supply Chain Verification</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        return await ResendEmailService._send_email(email, subject, html_body, "password_reset")
    
    @staticmethod
    async def send_welcome_email(email: str, full_name: str) -> bool:
        """Send welcome email after verification"""
        login_url = f"{ResendEmailService.FRONTEND_URL}/login"
        
        subject = "Welcome to PackGuard!"
        html_body = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }}
                .content {{ background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }}
                .button {{ display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }}
                .footer {{ text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }}
                .feature {{ padding: 10px 0; border-bottom: 1px solid #e5e7eb; }}
                .feature:last-child {{ border-bottom: none; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🎉 Welcome to PackGuard!</h1>
                </div>
                <div class="content">
                    <p>Hi {full_name},</p>
                    <p>Your email has been verified successfully! You now have full access to PackGuard.</p>
                    
                    <h3>What you can do now:</h3>
                    <div class="feature">✅ Register and manage products</div>
                    <div class="feature">✅ Generate QR codes for verification</div>
                    <div class="feature">✅ Track supply chain movements</div>
                    <div class="feature">✅ Verify product authenticity</div>
                    
                    <p style="text-align: center;">
                        <a href="{login_url}" class="button">Go to Dashboard</a>
                    </p>
                </div>
                <div class="footer">
                    <p>&copy; 2026 PackGuard. All rights reserved.</p>
                    <p>Product Authentication & Supply Chain Verification</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        return await ResendEmailService._send_email(email, subject, html_body, "welcome")
    
    @staticmethod
    async def send_account_locked_email(email: str, full_name: str, unlock_time: datetime) -> bool:
        """Send account locked notification"""
        subject = "PackGuard Account Security Alert"
        html_body = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }}
                .content {{ background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }}
                .footer {{ text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }}
                .alert {{ background: #fee2e2; border: 1px solid #ef4444; padding: 15px; border-radius: 6px; margin: 15px 0; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🔒 Account Locked</h1>
                </div>
                <div class="content">
                    <p>Hi {full_name},</p>
                    <div class="alert">
                        <strong>Your account has been temporarily locked</strong> due to multiple failed login attempts.
                    </div>
                    <p>Your account will be automatically unlocked at:</p>
                    <p style="text-align: center; font-size: 18px; font-weight: bold;">{unlock_time.strftime('%Y-%m-%d %H:%M:%S UTC')}</p>
                    <p>If you didn't attempt to log in, someone may be trying to access your account. We recommend:</p>
                    <ul>
                        <li>Changing your password after the lockout expires</li>
                        <li>Enabling two-factor authentication</li>
                        <li>Contacting support if you need immediate assistance</li>
                    </ul>
                </div>
                <div class="footer">
                    <p>&copy; 2026 PackGuard. All rights reserved.</p>
                    <p>Contact: support@packguard.org</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        return await ResendEmailService._send_email(email, subject, html_body, "account_locked")
    
    @staticmethod
    async def _send_email(to_email: str, subject: str, html_body: str, email_type: str) -> bool:
        """
        Send email via Resend HTTP API.
        """
        api_key = ResendEmailService._get_api_key()
        send_emails = getattr(settings, 'SEND_EMAILS', False)
        
        if not send_emails or not api_key:
            # Log to console instead of sending
            logger.info(f"""
╔══════════════════════════════════════════════════════════════╗
║                    EMAIL ({email_type.upper()})                        
╠══════════════════════════════════════════════════════════════╣
║ To: {to_email}
║ Subject: {subject}
║ 
║ [HTML Email Content - View in browser for full formatting]
║ 
║ NOTE: Email not sent. Set SEND_EMAILS=True and configure
║       RESEND_API_KEY to send real emails.
╚══════════════════════════════════════════════════════════════╝
            """)
            return True
        
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.post(
                    ResendEmailService.API_URL,
                    headers={
                        "Authorization": f"Bearer {api_key}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "from": ResendEmailService._get_from_email(),
                        "to": [to_email],
                        "subject": subject,
                        "html": html_body
                    }
                )
                
                if response.status_code == 200:
                    logger.info(f"✅ Email sent successfully via Resend: {email_type} to {to_email}")
                    return True
                else:
                    logger.error(f"❌ Resend API error: {response.status_code} - {response.text}")
                    return False
                    
        except httpx.TimeoutException:
            logger.error(f"❌ Resend API timeout for {email_type} to {to_email}")
            return False
        except Exception as e:
            logger.error(f"❌ Failed to send {email_type} email to {to_email}: {e}")
            return False


# Create singleton instance for convenience
resend_email_service = ResendEmailService()
