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
from app.models.employee import Employee
from app.schemas.employee import EmployeeResponse
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
        # First check if it's a user
        user = await UserService.get_by_email(db, request.email.lower())
        if user:
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

        # If not a user, check if it's an employee
        employee = await db.execute(
            select(Employee).where(Employee.email == request.email.lower())
        )
        employee = employee.scalar_one_or_none()

        if employee:
            otp = generate_otp(6)
            employee.otp = otp
            employee.otp_expiry = datetime.now() + timedelta(minutes=10)
            await mail_service.send_otp_email(
                to_email=request.email, otp=otp, name=employee.name
            )
            await db.commit()
            return {
                "message": "OTP sent successfully on email",
            }

        # If neither user nor employee found
        raise HTTPException(status_code=400, detail="User not found")

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
        # First check if it's a user
        user = await UserService.get_by_email(db, request.email.lower())
        if user:
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

        # If not a user, check if it's an employee
        employee = await db.execute(
            select(Employee).where(Employee.email == request.email.lower())
        )
        employee = employee.scalar_one_or_none()

        if employee:
            if employee.otp != request.otp:
                raise HTTPException(status_code=400, detail="Invalid OTP")
            if employee.otp_expiry < datetime.now():
                raise HTTPException(status_code=400, detail="OTP expired")
            employee.hashed_password = Security.get_password_hash(request.password)
            employee.otp = None
            employee.otp_expiry = None
            await db.commit()
            await db.refresh(employee)
            return {
                "message": "Password updated successfully",
            }

        # If neither user nor employee found
        raise HTTPException(status_code=400, detail="User not found")

    except HTTPException as e:
        raise e


class LoginRequest(BaseModel):
    email: str
    password: str


@router.post("/login")
async def login(request: LoginRequest, db: AsyncSession = Depends(get_db)):
    try:
        # First check if it's a user
        user_query = await db.execute(
            select(User).where(User.email == request.email.lower())
        )
        user = user_query.scalar_one_or_none()

        if user:
            # Handle user login
            if not user.is_active:
                raise HTTPException(
                    status_code=400, detail="User account is not active"
                )
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
                "account_type": "user",
            }

        # If not a user, check if it's an employee
        employee_query = await db.execute(
            select(Employee).where(Employee.email == request.email.lower())
        )
        employee = employee_query.scalar_one_or_none()

        if employee:
            # Handle employee login
            if not employee.is_active:
                raise HTTPException(
                    status_code=400, detail="Employee account is not active"
                )
            # if not employee.email_verified:
            #     raise HTTPException(status_code=400, detail="Email not verified")
            password_match = Security.verify_password(
                request.password, employee.hashed_password
            )
            if not password_match:
                raise HTTPException(status_code=400, detail="Invalid password")

            access_token = Security.create_access_token(employee)
            refresh_token = Security.create_refresh_token(employee)

            return {
                "user": EmployeeResponse(**employee.__dict__),
                "access_token": access_token,
                "refresh_token": refresh_token,
                "account_type": "employee",
            }

        # If neither user nor employee found
        raise HTTPException(status_code=400, detail="User not found")

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
        # First check if it's a user
        user = await db.execute(select(User).where(User.email == request.email.lower()))
        user = user.scalar_one_or_none()

        if user:
            # Handle user email verification
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
                "account_type": "user",
            }

        # If not a user, check if it's an employee
        employee = await db.execute(
            select(Employee).where(Employee.email == request.email.lower())
        )
        employee = employee.scalar_one_or_none()

        if employee:
            # Handle employee email verification
            # if employee.email_verified:
            #     raise HTTPException(status_code=400, detail="Email already verified")
            if employee.otp_expiry < datetime.now():
                raise HTTPException(status_code=400, detail="OTP expired")
            if employee.otp != request.otp:
                raise HTTPException(status_code=400, detail="Invalid OTP")
            employee.email_verified = True
            employee.is_active = True
            employee.otp = None
            employee.otp_expiry = None
            await db.commit()
            await db.refresh(employee)
            access_token = Security.create_access_token(employee)
            refresh_token = Security.create_refresh_token(employee)

            return {
                "user": EmployeeResponse(**employee.__dict__),
                "access_token": access_token,
                "refresh_token": refresh_token,
                "account_type": "employee",
            }

        # If neither user nor employee found
        raise HTTPException(status_code=400, detail="User not found")

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
    # The auth_middleware now returns either UserResponse or EmployeeResponse
    # We can check the type to determine the response format
    if hasattr(user, "organization_id"):
        # This is an employee
        return {
            "employee": user,
        }
    else:
        # This is a user
        return {
            "user": user,
        }
