from pydantic_settings import BaseSettings
from typing import Optional
import os
from dotenv import load_dotenv


load_dotenv()


class Settings(BaseSettings):
    # Application settings
    env: str = "development"
    app_name: str = "Momentum Fastapi"
    app_version: str = "1.0.0"
    debug: bool = False

    # Database settings
    database_url: Optional[str] = None
    database_password: Optional[str] = None

    postgres_user: Optional[str] = "postgres"
    postgres_password: Optional[str] = "password"
    postgres_server: Optional[str] = "localhost"
    postgres_port: Optional[str] = "5432"
    postgres_db: Optional[str] = "fastapi_db"

    # JWT environment variable mappings
    jwt_secret_key: str = "your-secret-key-here-change-in-production"
    jwt_algorithm: str = "HS256"
    jwt_access_token_expire_minutes: int = 30

    # CORS settings
    cors_origins: list = [
        "*",
        "http://localhost:8080",
        "http://127.0.0.1:8080",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]
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
