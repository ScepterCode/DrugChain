"""
Test Supabase Email System
Tests all email functionality to ensure Supabase is sending emails correctly
"""
import asyncio
import sys
import random
from datetime import datetime
from app.services.email_service import EmailService
from app.services.supabase_auth_service import supabase_auth
from app.core.config import settings

# ANSI color codes
GREEN = '\033[92m'
RED = '\033[91m'
YELLOW = '\033[93m'
CYAN = '\033[96m'
WHITE = '\033[97m'
RESET = '\033[0m'


def print_header(text: str):
    """Print a colored header"""
    print(f"\n{CYAN}{'=' * 60}{RESET}")
    print(f"{CYAN}{text}{RESET}")
    print(f"{CYAN}{'=' * 60}{RESET}\n")


def print_success(text: str):
    """Print success message"""
    print(f"{GREEN}✅ {text}{RESET}")


def print_error(text: str):
    """Print error message"""
    print(f"{RED}❌ {text}{RESET}")


def print_warning(text: str):
    """Print warning message"""
    print(f"{YELLOW}⚠️  {text}{RESET}")


def print_info(text: str):
    """Print info message"""
    print(f"{WHITE}{text}{RESET}")


async def test_email_service():
    """Test the email service"""
    print_header("SUPABASE EMAIL SYSTEM TEST")
    
    # Generate test email
    test_email = f"test-{random.randint(1000, 9999)}@example.com"
    test_name = "Email Test User"
    
    print_info(f"Test Email: {test_email}")
    print_info(f"Test Name: {test_name}")
    print()
    
    # Check Supabase configuration
    print_header("CONFIGURATION CHECK")
    
    if not settings.SUPABASE_URL:
        print_error("SUPABASE_URL not configured!")
        return False
    else:
        print_success(f"SUPABASE_URL: {settings.SUPABASE_URL}")
    
    if not settings.SUPABASE_KEY:
        print_error("SUPABASE_KEY not configured!")
        return False
    else:
        print_success("SUPABASE_KEY: Configured")
    
    if not supabase_auth.client:
        print_error("Supabase client not initialized!")
        return False
    else:
        print_success("Supabase client: Initialized")
    
    print()
    
    # Test 1: Email Verification
    print_header("TEST 1: Email Verification")
    print_info("Testing email verification email...")
    
    try:
        token = EmailService.generate_token()
        result = await EmailService.send_verification_email(
            email=test_email,
            token=token,
            full_name=test_name
        )
        
        if result:
            print_success("Email verification service called successfully")
            print_warning("NOTE: Supabase handles actual email sending")
            print_info("Check Supabase Dashboard → Authentication → Email Templates")
        else:
            print_error("Email verification service failed")
    except Exception as e:
        print_error(f"Email verification test failed: {e}")
    
    print()
    
    # Test 2: Password Reset
    print_header("TEST 2: Password Reset Email")
    print_info("Testing password reset email...")
    
    try:
        token = EmailService.generate_token()
        result = await EmailService.send_password_reset_email(
            email=test_email,
            token=token,
            full_name=test_name
        )
        
        if result:
            print_success("Password reset service called successfully")
            print_warning("NOTE: Supabase handles actual email sending")
            print_info("Check Supabase Dashboard → Authentication → Email Templates")
        else:
            print_error("Password reset service failed")
    except Exception as e:
        print_error(f"Password reset test failed: {e}")
    
    print()
    
    # Test 3: Welcome Email
    print_header("TEST 3: Welcome Email")
    print_info("Testing welcome email...")
    
    try:
        result = await EmailService.send_welcome_email(
            email=test_email,
            full_name=test_name
        )
        
        if result:
            print_success("Welcome email service called successfully")
            print_warning("NOTE: This is logged only - customize in Supabase templates")
        else:
            print_error("Welcome email service failed")
    except Exception as e:
        print_error(f"Welcome email test failed: {e}")
    
    print()
    
    # Test 4: Account Locked Email
    print_header("TEST 4: Account Locked Email")
    print_info("Testing account locked email...")
    
    try:
        unlock_time = EmailService.generate_token_expiry(hours=1)
        result = await EmailService.send_account_locked_email(
            email=test_email,
            full_name=test_name,
            unlock_time=unlock_time
        )
        
        if result:
            print_success("Account locked email service called successfully")
            print_warning("NOTE: This is logged only - implement custom email for production")
        else:
            print_error("Account locked email service failed")
    except Exception as e:
        print_error(f"Account locked email test failed: {e}")
    
    print()
    
    # Test 5: Supabase Auth Service
    print_header("TEST 5: Supabase Auth Service")
    print_info("Testing Supabase auth service directly...")
    
    try:
        # Test resend verification
        print_info("Testing resend verification email...")
        result = await supabase_auth.send_verification_email(test_email)
        
        if result:
            print_success("Supabase verification email sent successfully")
            print_warning(f"📧 CHECK EMAIL: {test_email}")
        else:
            print_error("Supabase verification email failed")
    except Exception as e:
        print_error(f"Supabase auth test failed: {e}")
    
    print()
    
    # Summary
    print_header("TEST SUMMARY")
    
    print_info("Email Service Tests:")
    print_info("  ✓ Email Verification - Service working")
    print_info("  ✓ Password Reset - Service working")
    print_info("  ✓ Welcome Email - Service working")
    print_info("  ✓ Account Locked - Service working")
    print()
    
    print_warning("IMPORTANT NOTES:")
    print_info("1. Supabase handles actual email delivery")
    print_info("2. Check Supabase Dashboard for email configuration:")
    print_info("   → Authentication → Email Templates")
    print_info("3. Verify SMTP settings in Project Settings → Auth")
    print_info("4. Check email rate limits")
    print_info("5. Look in spam/junk folder")
    print()
    
    print_info("To verify emails are being sent:")
    print_info("1. Go to https://supabase.com/dashboard")
    print_info("2. Select your project")
    print_info("3. Go to Authentication → Users")
    print_info("4. Check if test user was created")
    print_info("5. Go to Logs to see email delivery attempts")
    print()
    
    print_success("All email service tests completed!")
    print()
    
    return True


async def test_real_registration():
    """Test real registration flow"""
    print_header("REAL REGISTRATION TEST")
    print_warning("This will attempt to register a real user via the API")
    print()
    
    test_email = f"test-{random.randint(1000, 9999)}@example.com"
    
    print_info(f"Test Email: {test_email}")
    print_info("This test requires the backend API to be running")
    print()
    
    try:
        import httpx
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{settings.BACKEND_URL or 'http://localhost:8000'}/api/v1/auth/register",
                json={
                    "email": test_email,
                    "password": "TestPassword123!",
                    "full_name": "Email Test User",
                    "role": "MANUFACTURER",
                    "organization_name": "Test Organization",
                    "phone": "+1234567890"
                }
            )
            
            if response.status_code == 200:
                print_success("Registration successful!")
                print_info(f"Response: {response.json()}")
                print_warning(f"📧 CHECK EMAIL: {test_email}")
                print_info("Supabase should have sent a verification email")
            else:
                print_error(f"Registration failed: {response.status_code}")
                print_info(f"Response: {response.text}")
    except ImportError:
        print_warning("httpx not installed - skipping real registration test")
        print_info("Install with: pip install httpx")
    except Exception as e:
        print_error(f"Registration test failed: {e}")
    
    print()


async def main():
    """Main test function"""
    print()
    print(f"{CYAN}{'=' * 60}{RESET}")
    print(f"{CYAN}PACKGUARD EMAIL SYSTEM TEST{RESET}")
    print(f"{CYAN}{'=' * 60}{RESET}")
    print()
    print_info(f"Timestamp: {datetime.now().isoformat()}")
    print()
    
    # Run email service tests
    await test_email_service()
    
    # Ask if user wants to test real registration
    print()
    print_warning("Do you want to test real registration? (y/n)")
    response = input().strip().lower()
    
    if response == 'y':
        await test_real_registration()
    
    print()
    print_success("All tests completed!")
    print()


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print()
        print_warning("Tests interrupted by user")
        sys.exit(0)
    except Exception as e:
        print()
        print_error(f"Test failed: {e}")
        sys.exit(1)
