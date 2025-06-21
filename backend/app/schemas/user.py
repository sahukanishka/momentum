from pydantic import BaseModel, Field, ConfigDict

from app.models.user import UserRole
from datetime import datetime


class User(BaseModel):
    id: str
    name: str
    email: str
    role: UserRole
    is_active: bool
    email_verified: bool
    phone_verified: bool


class UserCreate(BaseModel):
    name: str
    email: str
    hashed_password: str
    role: UserRole
    otp: str = None
    otp_expiry: datetime = None
    email_verified: bool
    is_active: bool
    phone_verified: bool


class UserLogin(BaseModel):
    email: str
    password: str


class Token(BaseModel):
    access_token: str
    refresh_token: str


class TokenPayload(BaseModel):
    sub: str
    exp: int


class UserUpdate(BaseModel):
    name: str | None = None
    email: str | None = None
    password: str | None = None
    is_active: bool | None = None
    role: UserRole | None = None
    email_verified: bool | None = None
    phone_verified: bool | None = None
    otp: str | None = None
    otp_expiry: datetime | None = None
    created_at: datetime | None = None
    updated_at: datetime | None = None


class AdminUserCreate(BaseModel):
    name: str
    email: str
    hashed_password: str
    role: UserRole
    email_verified: bool
    is_active: bool


class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    role: UserRole
    is_active: bool
    email_verified: bool
    created_at: datetime
    updated_at: datetime
    phone_verified: bool
    otp: str | None = None
    otp_expiry: datetime | None = None

    model_config = ConfigDict(from_attributes=True)
