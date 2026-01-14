from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1.api import api_router
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="PackGuard API",
    version=settings.APP_VERSION,
    description="PackGuard - Universal Product Authentication Platform",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

# Define CORS origins explicitly
CORS_ORIGINS = [
    "https://drug-chain.vercel.app",  # Production frontend
    "http://localhost:3000",         # Local dev (React)
    "http://localhost:5173",         # Local dev (Vite)
    "http://localhost:5174",         # Local dev (Vite alt)
    "http://127.0.0.1:3000",         # Local dev (127.0.0.1)
]

# Log CORS configuration
logger.info(f"CORS Origins configured: {CORS_ORIGINS}")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API router
app.include_router(api_router, prefix="/api/v1")


@app.get("/")
async def root():
    return {
        "message": "PackGuard API",
        "version": settings.APP_VERSION,
        "status": "running",
        "description": "Universal Product Authentication Platform"
    }


@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "packguard-api"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
