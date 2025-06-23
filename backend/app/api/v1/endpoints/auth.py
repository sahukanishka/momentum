from datetime import timedelta
from typing import List
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy import select
from app.core.mail import MailService
from app.core.security import Security
from app.db.database import get_db
from sqlalchemy.ext.asyncio import AsyncSession
from app.middleware.auth_middleware import auth_middleware
from app.schemas.organization import OrganizationResponse
from app.schemas.user import UserResponse, UserUpdate
from app.services.organization_service import OrganizationService
from app.services.user_service import UserService
from app.utils.utils import generate_otp, validate_password
from app.models.user import User, UserRole
from datetime import datetime
from pydantic import EmailStr

mail_service = MailService()

router = APIRouter()


# @router.get("/")
# async def check_auth():
#     raise HTTPException(status_code=401, detail="Unauthorized")


class RegisterUserRequest(BaseModel):
    email: EmailStr
    password: str
    name: str


# @router.post("/register")
# async def register(request: RegisterUserRequest, db: AsyncSession = Depends(get_db)):
#     try:
#         existing_user = await UserService.get_by_email(db, request.email.lower())
#         if existing_user:
#             raise HTTPException(status_code=400, detail="User already exists")
#         if not validate_password(request.password):
#             raise HTTPException(status_code=400, detail="Invalid password")
#         hashed_password = Security.get_password_hash(request.password)
#         user_dict = request.model_dump()
#         user_dict.pop("password", None)  # Remove password key from user_dict
#         user_dict["hashed_password"] = hashed_password
#         user_dict["otp"] = generate_otp(6)
#         user_dict["otp_expiry"] = datetime.now() + timedelta(minutes=10)
#         user_dict["role"] = UserRole.USER
#         user_dict["email"] = request.email.lower()
#         await mail_service.send_otp_email(
#             to_email=request.email, otp=user_dict["otp"], name=user_dict["name"]
#         )

#         await UserService.create(db, user_dict)
#         return {
#             "message": "Otp sent successfully on email",
#         }
#     except HTTPException as e:
#         raise e
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))


class SignupRequest(BaseModel):
    email: EmailStr
    password: str
    name: str
    role: UserRole = UserRole.USER


@router.post("/signup")
async def signup(request: SignupRequest, db: AsyncSession = Depends(get_db)):
    try:
        if not validate_password(request.password):
            raise HTTPException(status_code=400, detail="Invalid is password")
        existing_user = await db.execute(
            select(User).where(User.email == request.email.lower())
        )
        existing_user = existing_user.scalar_one_or_none()
        if existing_user:
            raise HTTPException(status_code=400, detail="User already exists")
        hashed_password = Security.get_password_hash(request.password)
        otp = generate_otp(6)
        user_dict = request.model_dump()
        user_dict.pop("password", None)
        user_dict["hashed_password"] = hashed_password
        user_dict["otp"] = otp
        user_dict["otp_expiry"] = datetime.now() + timedelta(minutes=10)
        user_dict["email"] = request.email.lower()
        await mail_service.send_otp_email(
            to_email=request.email, otp=otp, name=user_dict["name"]
        )
        await UserService.create(db, user_dict)

        return {
            "message": "Otp sent successfully on email",
        }
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


class SendOtpRequest(BaseModel):
    email: EmailStr


@router.post("/send-otp")
async def send_otp(request: SendOtpRequest, db: AsyncSession = Depends(get_db)):
    try:
        user = await UserService.get_by_email(db, request.email.lower())
        if not user:
            raise HTTPException(status_code=400, detail="User not found")
        otp = generate_otp(6)
        user_dict = {
            "otp": otp,
            "otp_expiry": datetime.now() + timedelta(minutes=10),
        }
        await mail_service.send_otp_email(
            to_email=request.email, otp=otp, name=user.name
        )
        await UserService.update(
            db, user_id=user.id, user_update=UserUpdate(**user_dict)
        )
        return {
            "message": "OTP sent successfully on email",
        }
    except HTTPException as e:
        raise e


class ResetPasswordRequest(BaseModel):
    email: EmailStr
    otp: str
    password: str


@router.post("/reset-password")
async def reset_password(
    request: ResetPasswordRequest, db: AsyncSession = Depends(get_db)
):
    try:
        user = await UserService.get_by_email(db, request.email.lower())
        if not user:
            raise HTTPException(status_code=400, detail="User not found")
        if user.otp != request.otp:
            raise HTTPException(status_code=400, detail="Invalid OTP")
        if user.otp_expiry < datetime.now():
            raise HTTPException(status_code=400, detail="OTP expired")
        user.hashed_password = Security.get_password_hash(request.password)
        user.otp = None
        user.otp_expiry = None
        await db.commit()
        await db.refresh(user)
        return {
            "message": "Password updated successfully",
        }
    except HTTPException as e:
        raise e


class LoginRequest(BaseModel):
    email: str
    password: str


@router.post("/login")
async def login(request: LoginRequest, db: AsyncSession = Depends(get_db)):
    try:
        user_query = await db.execute(
            select(User).where(User.email == request.email.lower())
        )
        user = user_query.scalar_one_or_none()
        if not user:
            raise HTTPException(status_code=400, detail="User not found")
        if not user.is_active:
            raise HTTPException(status_code=400, detail="User account is not active")
        if not user.email_verified:
            raise HTTPException(status_code=400, detail="Email not verified")
        password_match = Security.verify_password(
            request.password, user.hashed_password
        )
        if not password_match:
            raise HTTPException(status_code=400, detail="Invalid password")
        access_token = Security.create_access_token(user)
        refresh_token = Security.create_refresh_token(user)
        user_response = UserResponse(**user.__dict__)
        organizations, total = await OrganizationService.get_user_organizations(
            db=db, user_id=user.id, skip=0, limit=10
        )
        organizations_response = [
            OrganizationResponse.model_validate(org) for org in organizations
        ]

        return {
            "user": user_response,
            "access_token": access_token,
            "refresh_token": refresh_token,
            "organizations": organizations_response,
        }
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


class VerifyEmailRequest(BaseModel):
    email: str
    otp: str


@router.post("/verify-email")
async def verify_email(request: VerifyEmailRequest, db: AsyncSession = Depends(get_db)):
    try:
        user = await db.execute(select(User).where(User.email == request.email.lower()))
        user = user.scalar_one_or_none()
        if not user:
            raise HTTPException(status_code=400, detail="User not found")
        if user.email_verified:
            raise HTTPException(status_code=400, detail="Email already verified")
        if user.otp_expiry < datetime.now():
            raise HTTPException(status_code=400, detail="OTP expired")
        if user.otp != request.otp:
            raise HTTPException(status_code=400, detail="Invalid OTP")
        user.email_verified = True
        user.is_active = True
        user.otp = None
        user.otp_expiry = None
        await db.commit()
        await db.refresh(user)
        access_token = Security.create_access_token(user)
        refresh_token = Security.create_refresh_token(user)
        user_response = UserResponse(**user.__dict__)
        return {
            "user": user_response,
            "access_token": access_token,
            "refresh_token": refresh_token,
        }
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


class LoginGoogleRequest(BaseModel):
    token: str


# @router.post("/login-google")
# async def login_google(request: LoginGoogleRequest):
#     pass


class LogoutRequest(BaseModel):
    refresh_token: str


# @router.post("/logout")
# async def logout(request: LogoutRequest):
#     pass


@router.get("/me")
async def me(user=Depends(auth_middleware), db: AsyncSession = Depends(get_db)):
    user_query = await db.execute(select(User).where(User.id == user.id))
    user = user_query.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=400, detail="User not found")
    user_response = UserResponse(**user.__dict__)
    return {
        "user": user_response,
    }
