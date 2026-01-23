from sqlalchemy.orm import Session
from app.models.audit_log import AuditLog
from typing import Optional, Dict, Any
from datetime import datetime


class AuditService:
    """Service for logging audit events"""
    
    @staticmethod
    def log_event(
        db: Session,
        action: str,
        status: str,
        user_id: Optional[str] = None,
        resource_type: Optional[str] = None,
        resource_id: Optional[str] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None
    ) -> AuditLog:
        """
        Log an audit event
        
        Args:
            action: Action performed (LOGIN, LOGOUT, REGISTER, etc.)
            status: SUCCESS or FAILURE
            user_id: User who performed the action
            resource_type: Type of resource affected
            resource_id: ID of resource affected
            ip_address: IP address of request
            user_agent: User agent string
            details: Additional context as JSON
        """
        audit_log = AuditLog(
            user_id=user_id,
            action=action,
            resource_type=resource_type,
            resource_id=resource_id,
            ip_address=ip_address,
            user_agent=user_agent,
            details=details,
            status=status,
            created_at=datetime.utcnow()
        )
        
        db.add(audit_log)
        db.commit()
        
        return audit_log
    
    @staticmethod
    def log_login_attempt(
        db: Session,
        email: str,
        success: bool,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
        failure_reason: Optional[str] = None
    ):
        """Log a login attempt"""
        return AuditService.log_event(
            db=db,
            action="LOGIN_ATTEMPT",
            status="SUCCESS" if success else "FAILURE",
            ip_address=ip_address,
            user_agent=user_agent,
            details={
                "email": email,
                "failure_reason": failure_reason
            }
        )
    
    @staticmethod
    def log_logout(
        db: Session,
        user_id: str,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None
    ):
        """Log a logout event"""
        return AuditService.log_event(
            db=db,
            action="LOGOUT",
            status="SUCCESS",
            user_id=user_id,
            ip_address=ip_address,
            user_agent=user_agent
        )
    
    @staticmethod
    def log_registration(
        db: Session,
        user_id: str,
        email: str,
        role: str,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None
    ):
        """Log a user registration"""
        return AuditService.log_event(
            db=db,
            action="REGISTER",
            status="SUCCESS",
            user_id=user_id,
            resource_type="USER",
            resource_id=user_id,
            ip_address=ip_address,
            user_agent=user_agent,
            details={
                "email": email,
                "role": role
            }
        )
    
    @staticmethod
    def log_password_reset_request(
        db: Session,
        email: str,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None
    ):
        """Log a password reset request"""
        return AuditService.log_event(
            db=db,
            action="PASSWORD_RESET_REQUEST",
            status="SUCCESS",
            ip_address=ip_address,
            user_agent=user_agent,
            details={"email": email}
        )
    
    @staticmethod
    def log_password_change(
        db: Session,
        user_id: str,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None
    ):
        """Log a password change"""
        return AuditService.log_event(
            db=db,
            action="PASSWORD_CHANGE",
            status="SUCCESS",
            user_id=user_id,
            resource_type="USER",
            resource_id=user_id,
            ip_address=ip_address,
            user_agent=user_agent
        )
    
    @staticmethod
    def log_account_lockout(
        db: Session,
        user_id: str,
        email: str,
        ip_address: Optional[str] = None
    ):
        """Log an account lockout"""
        return AuditService.log_event(
            db=db,
            action="ACCOUNT_LOCKED",
            status="SUCCESS",
            user_id=user_id,
            resource_type="USER",
            resource_id=user_id,
            ip_address=ip_address,
            details={"email": email, "reason": "Too many failed login attempts"}
        )
