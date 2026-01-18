from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1.api import api_router
import logging
import time

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

# Request logging middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    logger.info(f"Incoming request: {request.method} {request.url.path}")
    logger.info(f"Request headers: {dict(request.headers)}")
    
    try:
        response = await call_next(request)
        process_time = time.time() - start_time
        logger.info(f"Response status: {response.status_code} - Time: {process_time:.4f}s")
        return response
    except Exception as e:
        process_time = time.time() - start_time
        logger.error(f"Request failed: {str(e)} - Time: {process_time:.4f}s")
        raise

# Get CORS origins from settings (which reads from .env)
CORS_ORIGINS = settings.CORS_ORIGINS if isinstance(settings.CORS_ORIGINS, list) else [
    "https://pack-guard.vercel.app",  # Production frontend (NEW)
    "https://drug-chain.vercel.app",  # Production frontend (OLD)
    "http://localhost:3000",         # Local dev (React)
    "http://localhost:5173",         # Local dev (Vite)
    "http://localhost:5174",         # Local dev (Vite alt)
    "http://127.0.0.1:3000",         # Local dev (127.0.0.1)
]

# Log CORS configuration
logger.info(f"CORS Origins configured: {CORS_ORIGINS}")

# CORS middleware with more permissive settings for production debugging
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600,  # Cache preflight requests for 1 hour
)

# Explicit OPTIONS handler for all routes (CORS preflight)
@app.options("/{full_path:path}")
async def options_handler(full_path: str):
    return {"message": "OK"}

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
