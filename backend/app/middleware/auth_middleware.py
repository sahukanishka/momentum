from fastapi import HTTPException, Depends
from jose import jwt
from app.models.user import User
from app.db.database import get_db
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi.security import OAuth2PasswordBearer
import os
from dotenv import load_dotenv

from app.schemas.user import UserResponse

load_dotenv()


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")


async def auth_middleware(
    token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)
):
    try:

        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=["HS256"])
        print("payload", payload["id"])
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
