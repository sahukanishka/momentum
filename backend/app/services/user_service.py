from typing import Optional, List
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from app.schemas.user import UserCreate, UserUpdate, UserResponse
from app.models.user import User, UserRole
from app.core.security import Security


class UserService:

    @staticmethod
    async def get_by_email(session: AsyncSession, email: str) -> Optional[UserResponse]:
        result = await session.execute(select(User).where(User.email == email))
        user = result.scalar_one_or_none()
        return user

    @staticmethod
    async def get_by_id(session: AsyncSession, user_id: str) -> Optional[UserResponse]:
        result = await session.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        return UserResponse.model_validate(user) if user else None

    @classmethod
    async def create(cls, session: AsyncSession, user: UserCreate) -> UserResponse:

        db_user = User(**user)
        session.add(db_user)
        await session.commit()
        await session.refresh(db_user)

        return UserResponse.model_validate(db_user) if db_user else None

    @classmethod
    async def update(
        cls, session: AsyncSession, user_id: str, user_update: UserUpdate
    ) -> Optional[UserResponse]:
        result = await session.execute(select(User).where(User.id == user_id))
        db_user = result.scalar_one_or_none()
        if not db_user:
            return None

        update_data = user_update.model_dump(exclude_unset=True)
        if "password" in update_data:
            update_data["hashed_password"] = Security.get_password_hash(
                update_data.pop("password")
            )

        for key, value in update_data.items():
            setattr(db_user, key, value)

        await session.commit()
        await session.refresh(db_user)
        print("db_user", db_user)
        return UserResponse.model_validate(db_user) if db_user else None

    @staticmethod
    async def delete(session: AsyncSession, user_id: int) -> bool:
        result = await session.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        if not user:
            return False

        await session.delete(user)
        await session.commit()
        return True

    @staticmethod
    async def list(
        session: AsyncSession,
        skip: int = 0,
        limit: int = 100,
        role: UserRole = None,
    ) -> List[UserResponse]:
        query = select(User).offset(skip).limit(limit).order_by(User.created_at.desc())
        if role:
            query = query.where(User.role == role)
        result = await session.execute(query)
        users = result.scalars().all()
        return [UserResponse.model_validate(user) for user in users]

    @staticmethod
    async def get_total_count(session: AsyncSession, role: UserRole = None) -> int:
        query = select(func.count()).select_from(User)
        if role:
            query = query.where(User.role == role)
        result = await session.execute(query)
        return result.scalar_one()
