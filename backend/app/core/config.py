from pydantic_settings import BaseSettings
from typing import List, Union
import os


class Settings(BaseSettings):
    # App
    APP_NAME: str = "DrugChain API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = os.getenv("DEBUG", "False").lower() == "true"
    
    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    
    # Database - Supabase PostgreSQL
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "postgresql://postgres.aykzdgvdzmjhwsbjazon:YC5Er9AIs5vMeAmw@aws-0-eu-west-1.pooler.supabase.com:5432/postgres"
    )
    MONGODB_URL: str = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
    MONGODB_DB_NAME: str = "drugchain_logs"
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    
    # Security
    SECRET_KEY: str = os.getenv(
        "SECRET_KEY",
        "dev-secret-key-change-in-production-abc123"
    )
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # Supabase Auth
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "https://aykzdgvdzmjhwsbjazon.supabase.co")
    SUPABASE_KEY: str = os.getenv("SUPABASE_KEY", "")
    SUPABASE_SERVICE_KEY: str = os.getenv("SUPABASE_SERVICE_KEY", "")
    
    # Email Configuration (ADD THIS SECTION)
    MAIL_USERNAME: str = os.getenv("MAIL_USERNAME", "")
    MAIL_PASSWORD: str = os.getenv("MAIL_PASSWORD", "")
    MAIL_FROM: str = os.getenv("MAIL_FROM", "noreply@packguard.org")
    MAIL_FROM_NAME: str = os.getenv("MAIL_FROM_NAME", "PackGuard Team")
    MAIL_PORT: int = int(os.getenv("MAIL_PORT", "587"))
    MAIL_SERVER: str = os.getenv("MAIL_SERVER", "smtp.gmail.com")
    MAIL_STARTTLS: bool = os.getenv("MAIL_STARTTLS", "True").lower() == "true"
    MAIL_SSL_TLS: bool = os.getenv("MAIL_SSL_TLS", "False").lower() == "true"
    USE_CREDENTIALS: bool = os.getenv("USE_CREDENTIALS", "True").lower() == "true"
    VALIDATE_CERTS: bool = os.getenv("VALIDATE_CERTS", "True").lower() == "true"
    
    # Email sending mode
    SEND_EMAILS: bool = os.getenv("SEND_EMAILS", "False").lower() == "true"
    
    # Resend API (preferred email service - uses HTTP instead of SMTP)
    RESEND_API_KEY: str = os.getenv("RESEND_API_KEY", "")
    
    # Frontend URL for email links
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:5173")
    
    # Blockchain
    FABRIC_NETWORK_URL: str = os.getenv("FABRIC_NETWORK_URL", "grpc://localhost:7051")
    FABRIC_CHAINCODE_NAME: str = "drugchain"
    FABRIC_CHANNEL_NAME: str = "drugchain-channel"
    
    # SMS
    AFRICASTALKING_USERNAME: str = os.getenv("AFRICASTALKING_USERNAME", "sandbox")
    AFRICASTALKING_API_KEY: str = os.getenv("AFRICASTALKING_API_KEY", "sandbox-api-key")
    AFRICASTALKING_SENDER_ID: str = "DRUGCHAIN"
    
    # Storage
    QR_CODE_STORAGE_PATH: str = "./storage/qr_codes"
    UPLOAD_MAX_SIZE_MB: int = 10
    
    # Blockchain Configuration (Hyperledger Fabric)
    FABRIC_GATEWAY_URL: str = os.getenv("FABRIC_GATEWAY_URL", "http://localhost:8080")
    FABRIC_CHANNEL: str = "drugchainchannel"
    FABRIC_CHAINCODE: str = "drugchain"
    FABRIC_ORG: str = "Org1MSP"
    FABRIC_USER: str = "admin"
    BLOCKCHAIN_ENABLED: bool = os.getenv("BLOCKCHAIN_ENABLED", "True").lower() == "true"
    
    # CORS
    CORS_ORIGINS: Union[List[str], str] = os.getenv(
        "CORS_ORIGINS",
        "https://packguard.vercel.app,https://pack-guard.vercel.app,https://drug-chain.vercel.app,http://localhost:3000,http://localhost:3001,http://localhost:5174,http://localhost:5173"
    )
    
    # Celery
    CELERY_BROKER_URL: str = os.getenv("CELERY_BROKER_URL", "redis://localhost:6379/1")
    CELERY_RESULT_BACKEND: str = os.getenv("CELERY_RESULT_BACKEND", "redis://localhost:6379/2")
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # Convert CORS_ORIGINS string to list if needed
        if isinstance(self.CORS_ORIGINS, str):
            self.CORS_ORIGINS = [origin.strip() for origin in self.CORS_ORIGINS.split(',')]
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()

