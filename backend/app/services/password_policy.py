import re
from typing import List, Tuple


class PasswordPolicy:
    """Password policy enforcement"""
    
    MIN_LENGTH = 8
    REQUIRE_UPPERCASE = True
    REQUIRE_LOWERCASE = True
    REQUIRE_DIGIT = True
    REQUIRE_SPECIAL = True
    
    @staticmethod
    def validate_password(password: str) -> Tuple[bool, List[str]]:
        """
        Validate password against policy
        
        Returns:
            (is_valid, list_of_errors)
        """
        errors = []
        
        # Check minimum length
        if len(password) < PasswordPolicy.MIN_LENGTH:
            errors.append(f"Password must be at least {PasswordPolicy.MIN_LENGTH} characters long")
        
        # Check for uppercase
        if PasswordPolicy.REQUIRE_UPPERCASE and not re.search(r'[A-Z]', password):
            errors.append("Password must contain at least one uppercase letter")
        
        # Check for lowercase
        if PasswordPolicy.REQUIRE_LOWERCASE and not re.search(r'[a-z]', password):
            errors.append("Password must contain at least one lowercase letter")
        
        # Check for digit
        if PasswordPolicy.REQUIRE_DIGIT and not re.search(r'\d', password):
            errors.append("Password must contain at least one number")
        
        # Check for special character
        if PasswordPolicy.REQUIRE_SPECIAL and not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
            errors.append("Password must contain at least one special character (!@#$%^&*(),.?\":{}|<>)")
        
        # Check for common weak passwords
        weak_passwords = ['password', '12345678', 'qwerty', 'abc123', 'password123']
        if password.lower() in weak_passwords:
            errors.append("This password is too common. Please choose a stronger password")
        
        return (len(errors) == 0, errors)
    
    @staticmethod
    def get_password_strength(password: str) -> str:
        """
        Calculate password strength
        
        Returns:
            'weak', 'medium', 'strong', or 'very_strong'
        """
        score = 0
        
        # Length score
        if len(password) >= 8:
            score += 1
        if len(password) >= 12:
            score += 1
        if len(password) >= 16:
            score += 1
        
        # Character variety score
        if re.search(r'[a-z]', password):
            score += 1
        if re.search(r'[A-Z]', password):
            score += 1
        if re.search(r'\d', password):
            score += 1
        if re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
            score += 1
        
        # Return strength
        if score <= 3:
            return 'weak'
        elif score <= 5:
            return 'medium'
        elif score <= 6:
            return 'strong'
        else:
            return 'very_strong'
