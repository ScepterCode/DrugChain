from fastapi import APIRouter, Depends
from app.api.dependencies import get_current_user, get_current_active_user
from app.models import User
from app.schemas import UserResponse

router = APIRouter()


@router.get("/profile", response_model=UserResponse)
async def get_user_profile(
    current_user: User = Depends(get_current_active_user)
):
    """
    Get current user profile.
    Requires authenticated and verified user.
    """
    return UserResponse.from_orm(current_user)


@router.put("/profile")
async def update_user_profile(
    current_user: User = Depends(get_current_active_user)
):
    """
    Update user profile.
    """
    return {
        "success": True,
        "message": "Profile update endpoint - full implementation coming soon"
    }
