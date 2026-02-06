from typing import Optional
import secrets
from datetime import datetime, timedelta, timezone
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core.config import settings
import logging
import asyncio
from concurrent.futures import ThreadPoolExecutor

logger = logging.getLogger(__name__)

# Thread pool for non-blocking email sending
email_executor = ThreadPoolExecutor(max_workers=3)


class EmailService:
    """
    Email service for sending verification and password reset emails
    
    Supports both SMTP sending and console logging (for development)
    Set SEND_EMAILS=True in environment to enable actual email sending
    """
    
    @staticmethod
    def _send_email_sync(to_email: str, subject: str, html_content: str, text_content: str) -> bool:
        """
        Synchronous internal method to send email via SMTP
        This runs in a thread pool to avoid blocking
        
        Args:
            to_email: Recipient email address
            subject: Email subject
            html_content: HTML version of email
            text_content: Plain text version of email
            
        Returns:
            True if sent successfully, False otherwise
        """
        # If email sending is disabled, just log to console
        if not settings.SEND_EMAILS:
            logger.info(f"""
            ========================================
            EMAIL (Console Mode - Not Sent)
            ========================================
            To: {to_email}
            Subject: {subject}
            
            {text_content}
            ========================================
            """)
            return True
        
        try:
            # Create message
            message = MIMEMultipart("alternative")
            message["Subject"] = subject
            message["From"] = f"{settings.MAIL_FROM_NAME} <{settings.MAIL_FROM}>"
            message["To"] = to_email
            
            # Attach both plain text and HTML versions
            part1 = MIMEText(text_content, "plain")
            part2 = MIMEText(html_content, "html")
            message.attach(part1)
            message.attach(part2)
            
            # Send email via SMTP with timeout
            with smtplib.SMTP(settings.MAIL_SERVER, settings.MAIL_PORT, timeout=10) as server:
                if settings.MAIL_STARTTLS:
                    server.starttls()
                
                if settings.USE_CREDENTIALS and settings.MAIL_USERNAME and settings.MAIL_PASSWORD:
                    server.login(settings.MAIL_USERNAME, settings.MAIL_PASSWORD)
                
                server.send_message(message)
            
            logger.info(f"Email sent successfully to {to_email}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send email to {to_email}: {str(e)}")
            # Fall back to console logging
            logger.info(f"""
            ========================================
            EMAIL (Failed to Send - Logged to Console)
            ========================================
            To: {to_email}
            Subject: {subject}
            Error: {str(e)}
            
            {text_content}
            ========================================
            """)
            return False
    
    @staticmethod
    async def _send_email(to_email: str, subject: str, html_content: str, text_content: str) -> bool:
        """
        Async wrapper for email sending - runs in thread pool to avoid blocking
        
        Args:
            to_email: Recipient email address
            subject: Email subject
            html_content: HTML version of email
            text_content: Plain text version of email
            
        Returns:
            True if sent successfully, False otherwise
        """
        loop = asyncio.get_event_loop()
        try:
            # Run the synchronous SMTP code in a thread pool with timeout
            result = await asyncio.wait_for(
                loop.run_in_executor(
                    email_executor,
                    EmailService._send_email_sync,
                    to_email,
                    subject,
                    html_content,
                    text_content
                ),
                timeout=15.0  # 15 second timeout for the entire operation
            )
            return result
        except asyncio.TimeoutError:
            logger.error(f"Email sending timed out for {to_email}")
            logger.info(f"Email to {to_email} will be logged to console due to timeout")
            # Log to console as fallback
            logger.info(f"""
            ========================================
            EMAIL (Timeout - Logged to Console)
            ========================================
            To: {to_email}
            Subject: {subject}
            
            {text_content}
            ========================================
            """)
            return False
        except Exception as e:
            logger.error(f"Unexpected error sending email to {to_email}: {str(e)}")
            return False
    
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
        verification_link = f"https://pack-guard.vercel.app/verify-email?token={token}"
        
        subject = "Verify your PackGuard account"
        
        # Plain text version
        text_content = f"""
Hi {full_name},

Thank you for registering with PackGuard!

Please verify your email address by clicking the link below:
{verification_link}

This link will expire in 24 hours.

If you didn't create this account, please ignore this email.

Need help? Contact us at Contact@packguard.org

Best regards,
PackGuard Team
"""
        
        # HTML version
        html_content = f"""
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background-color: #4F46E5; color: white; padding: 20px; text-align: center; }}
        .content {{ background-color: #f9fafb; padding: 30px; }}
        .button {{ display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }}
        .footer {{ text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>PackGuard</h1>
        </div>
        <div class="content">
            <h2>Hi {full_name},</h2>
            <p>Thank you for registering with PackGuard!</p>
            <p>Please verify your email address by clicking the button below:</p>
            <p style="text-align: center;">
                <a href="{verification_link}" class="button">Verify Email Address</a>
            </p>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #4F46E5;">{verification_link}</p>
            <p>This link will expire in 24 hours.</p>
            <p>If you didn't create this account, please ignore this email.</p>
        </div>
        <div class="footer">
            <p>Need help? Contact us at <a href="mailto:Contact@packguard.org">Contact@packguard.org</a></p>
            <p>&copy; 2026 PackGuard. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
"""
        
        return await EmailService._send_email(email, subject, html_content, text_content)
    
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
        reset_link = f"https://pack-guard.vercel.app/reset-password?token={token}"
        
        subject = "Reset your PackGuard password"
        
        # Plain text version
        text_content = f"""
Hi {full_name},

We received a request to reset your password.

Click the link below to reset your password:
{reset_link}

This link will expire in 1 hour.

If you didn't request this, please ignore this email and your password will remain unchanged.

Need help? Contact us at Contact@packguard.org

Best regards,
PackGuard Team
"""
        
        # HTML version
        html_content = f"""
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background-color: #4F46E5; color: white; padding: 20px; text-align: center; }}
        .content {{ background-color: #f9fafb; padding: 30px; }}
        .button {{ display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }}
        .footer {{ text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }}
        .warning {{ background-color: #FEF3C7; border-left: 4px solid #F59E0B; padding: 15px; margin: 20px 0; }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>PackGuard</h1>
        </div>
        <div class="content">
            <h2>Hi {full_name},</h2>
            <p>We received a request to reset your password.</p>
            <p>Click the button below to reset your password:</p>
            <p style="text-align: center;">
                <a href="{reset_link}" class="button">Reset Password</a>
            </p>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #4F46E5;">{reset_link}</p>
            <div class="warning">
                <strong>⚠️ Security Notice:</strong> This link will expire in 1 hour.
            </div>
            <p>If you didn't request this, please ignore this email and your password will remain unchanged.</p>
        </div>
        <div class="footer">
            <p>Need help? Contact us at <a href="mailto:Contact@packguard.org">Contact@packguard.org</a></p>
            <p>&copy; 2026 PackGuard. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
"""
        
        return await EmailService._send_email(email, subject, html_content, text_content)
    
    @staticmethod
    async def send_welcome_email(email: str, full_name: str) -> bool:
        """Send welcome email after email verification"""
        
        subject = "Welcome to PackGuard!"
        
        # Plain text version
        text_content = f"""
Hi {full_name},

Your email has been verified successfully!

You can now access all features of PackGuard:
- Product verification
- Batch management
- Supply chain tracking
- Analytics and reporting

Get started: https://pack-guard.vercel.app/portal/dashboard

Need help? Contact us at Contact@packguard.org

Best regards,
PackGuard Team
"""
        
        # HTML version
        html_content = f"""
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background-color: #10B981; color: white; padding: 20px; text-align: center; }}
        .content {{ background-color: #f9fafb; padding: 30px; }}
        .button {{ display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }}
        .footer {{ text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }}
        .features {{ background-color: white; padding: 20px; border-radius: 5px; margin: 20px 0; }}
        .feature-item {{ padding: 10px 0; border-bottom: 1px solid #e5e7eb; }}
        .feature-item:last-child {{ border-bottom: none; }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>✅ Welcome to PackGuard!</h1>
        </div>
        <div class="content">
            <h2>Hi {full_name},</h2>
            <p>Your email has been verified successfully!</p>
            <p>You now have access to all PackGuard features:</p>
            <div class="features">
                <div class="feature-item">✓ Product verification</div>
                <div class="feature-item">✓ Batch management</div>
                <div class="feature-item">✓ Supply chain tracking</div>
                <div class="feature-item">✓ Analytics and reporting</div>
            </div>
            <p style="text-align: center;">
                <a href="https://pack-guard.vercel.app/portal/dashboard" class="button">Get Started</a>
            </p>
        </div>
        <div class="footer">
            <p>Need help? Contact us at <a href="mailto:Contact@packguard.org">Contact@packguard.org</a></p>
            <p>&copy; 2026 PackGuard. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
"""
        
        return await EmailService._send_email(email, subject, html_content, text_content)
    
    @staticmethod
    async def send_account_locked_email(email: str, full_name: str, unlock_time: datetime) -> bool:
        """Send email when account is locked"""
        
        subject = "Your PackGuard account has been locked"
        
        # Plain text version
        text_content = f"""
Hi {full_name},

Your account has been temporarily locked due to multiple failed login attempts.

Your account will be automatically unlocked at: {unlock_time.strftime('%Y-%m-%d %H:%M:%S UTC')}

If this wasn't you, please contact us immediately at Contact@packguard.org

Best regards,
PackGuard Team
"""
        
        # HTML version
        html_content = f"""
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background-color: #EF4444; color: white; padding: 20px; text-align: center; }}
        .content {{ background-color: #f9fafb; padding: 30px; }}
        .footer {{ text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }}
        .alert {{ background-color: #FEE2E2; border-left: 4px solid #EF4444; padding: 15px; margin: 20px 0; }}
        .info-box {{ background-color: #DBEAFE; border-left: 4px solid #3B82F6; padding: 15px; margin: 20px 0; }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔒 Account Locked</h1>
        </div>
        <div class="content">
            <h2>Hi {full_name},</h2>
            <div class="alert">
                <strong>⚠️ Security Alert:</strong> Your account has been temporarily locked due to multiple failed login attempts.
            </div>
            <div class="info-box">
                <strong>Automatic Unlock Time:</strong><br>
                {unlock_time.strftime('%Y-%m-%d %H:%M:%S UTC')}
            </div>
            <p>If this wasn't you, please contact us immediately.</p>
            <p><strong>Contact:</strong> <a href="mailto:Contact@packguard.org">Contact@packguard.org</a></p>
        </div>
        <div class="footer">
            <p>&copy; 2026 PackGuard. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
"""
        
        return await EmailService._send_email(email, subject, html_content, text_content)
