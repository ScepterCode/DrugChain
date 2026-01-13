from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.api.dependencies import get_current_user
from app.models import User

router = APIRouter()

# For now, we'll return empty responses since notifications aren't fully implemented
# This prevents 404 errors in the frontend

@router.get("/notifications")
async def get_notifications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all notifications for the current user.
    Currently returns empty list - notifications feature not yet implemented.
    """
    return {
        "success": True,
        "data": []  # Empty notifications list
    }

@router.get("/notifications/unread-count")
async def get_unread_count(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get count of unread notifications for the current user.
    Currently returns 0 - notifications feature not yet implemented.
    """
    return {
        "success": True,
        "data": {
            "count": 0
        }
    }

@router.patch("/notifications/{notification_id}/read")
async def mark_notification_as_read(
    notification_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Mark a specific notification as read.
    Currently returns success - notifications feature not yet implemented.
    """
    return {
        "success": True,
        "message": "Notification marked as read"
    }

@router.patch("/notifications/read-all")
async def mark_all_notifications_as_read(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Mark all notifications as read for the current user.
    Currently returns success - notifications feature not yet implemented.
    """
    return {
        "success": True,
        "message": "All notifications marked as read"
    }

@router.delete("/notifications/{notification_id}")
async def delete_notification(
    notification_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a specific notification.
    Currently returns success - notifications feature not yet implemented.
    """
    return {
        "success": True,
        "message": "Notification deleted"
    }