from fastapi import APIRouter
from app.api.v1.endpoints import auth, users, products, categories, batches, verification, analytics, search, supply_chain, notifications, electronics, luxury

api_router = APIRouter()

# Include endpoint routers
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(categories.router, prefix="/categories", tags=["Product Categories"])
api_router.include_router(products.router, prefix="/products", tags=["Products"])
api_router.include_router(batches.router, prefix="/ids", tags=["ID Generation"])
api_router.include_router(verification.router, prefix="/verify", tags=["Verification"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["Analytics"])
api_router.include_router(search.router, prefix="/search", tags=["Search & Investigation"])
api_router.include_router(supply_chain.router, prefix="/supply-chain", tags=["Supply Chain"])
api_router.include_router(notifications.router, prefix="", tags=["Notifications"])

# Industry-specific endpoints
api_router.include_router(electronics.router, prefix="/electronics", tags=["Electronics"])
api_router.include_router(luxury.router, prefix="/luxury", tags=["Luxury Goods"])
