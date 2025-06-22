from passlib.context import CryptContext
from datetime import timedelta, datetime, timezone
from app.core.config import settings
from jose import jwt
import bcrypt
import os


pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
    bcrypt__rounds=12,
    bcrypt__ident="2b",
)


class Security:
    @staticmethod
    def get_password_hash(password: str) -> str:
        return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        return bcrypt.checkpw(
            plain_password.encode("utf-8"), hashed_password.encode("utf-8")
        )

    @staticmethod
    def create_access_token(
        data: dict,
        expires_delta: timedelta = timedelta(
            minutes=settings.jwt_access_token_expire_minutes
        ),
    ):
        token_data = {
            "email": data.email,
            "id": data.id,
            "role": data.role,
        }
        expire = datetime.now(timezone.utc) + expires_delta
        token_data.update({"exp": expire})
        encoded_jwt = jwt.encode(
            token_data,
            settings.jwt_JWT_SECRET_KEY,
            algorithm=settings.jwt_algorithm,
        )
        return encoded_jwt

    @staticmethod
    def create_refresh_token(data: dict, expires_delta: timedelta = timedelta(days=30)):
        token_data = {
            "sub": data.email,
            "user_id": data.id,
            "role": data.role,
        }
        expire = datetime.now(timezone.utc) + expires_delta
        token_data.update({"exp": expire})
        encoded_jwt = jwt.encode(
            token_data,
            settings.jwt_JWT_SECRET_KEY,
            algorithm=settings.jwt_algorithm,
        )
        return encoded_jwt

    @staticmethod
    def verify_token(token: str) -> dict:
        return jwt.decode(
            token, settings.jwt_JWT_SECRET_KEY, algorithms=[settings.jwt_algorithm]
        )
