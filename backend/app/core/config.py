from pydantic_settings import BaseSettings
from typing import Optional
import os
from dotenv import load_dotenv


load_dotenv()


class Settings(BaseSettings):
    # Application settings
    app_name: str = "Momentum Fastapi"
    app_version: str = "1.0.0"
    debug: bool = False

    # Database settings
    database_url: str = "postgresql://postgres:password@db:5432/fastapi_db"
    database_password: Optional[str] = None

    # JWT environment variable mappings
    jwt_secret_key: Optional[str] = None
    jwt_algorithm: Optional[str] = None
    jwt_access_token_expire_minutes: Optional[int] = None

    # CORS settings
    cors_origins: list = ["*"]
    cors_allow_credentials: bool = True
    cors_allow_methods: list = ["*"]
    cors_allow_headers: list = ["*"]

    # Email SMTP
    smtp_server_host: Optional[str] = None
    smtp_server_port: Optional[int] = None
    smtp_server_password: Optional[str] = None
    smtp_sender_email: Optional[str] = None

    # Server settings
    host: str = "0.0.0.0"
    port: int = 8000

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False
        extra = "allow"  # Allow extra fields from environment variables


# Create a global settings instance
settings = Settings()
