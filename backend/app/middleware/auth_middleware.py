from fastapi import HTTPException, Depends
from jose import jwt
from app.models.user import User
from app.models.employee import Employee
from app.db.database import get_db
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi.security import OAuth2PasswordBearer
import os
from dotenv import load_dotenv

from app.schemas.user import UserResponse
from app.schemas.employee import EmployeeResponse

load_dotenv()


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")


async def auth_middleware(
    token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)
):
    try:

        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=["HS256"])
        print("payload", payload["id"])

        account_type = payload.get(
            "account_type", "user"
        )  # Default to user for backward compatibility

        if account_type == "employee":

            # Handle employee authentication
            user_query = await db.execute(
                select(Employee).where(Employee.id == payload["id"])
            )
            user = user_query.scalar_one_or_none()

            if not user:
                raise HTTPException(status_code=404, detail="Employee not found")
            if not user.is_active:
                raise HTTPException(status_code=401, detail="Employee is not active")

            data = UserResponse(
                id=user.id,
                name=user.name,
                email=user.email,
                is_active=user.is_active,
                email_verified=user.email_verified,
                created_at=user.created_at,
                updated_at=user.updated_at,
                role="employee",
                phone_verified=False,
            )

        else:
            # Handle user authentication (default behavior)
            user_query = await db.execute(select(User).where(User.id == payload["id"]))
            user = user_query.scalar_one_or_none()

            if not user:
                raise HTTPException(status_code=404, detail="User not found")
            if not user.is_active:
                raise HTTPException(status_code=401, detail="User is not active")
            data = UserResponse(**user.__dict__)

        return data
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))
