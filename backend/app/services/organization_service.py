from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from typing import List, Optional
from app.models.organization import Organization
from app.models.user import User, UserRole
from app.schemas.organization import OrganizationCreate, OrganizationUpdate
from fastapi import HTTPException


class OrganizationService:
    @staticmethod
    async def create(
        db: AsyncSession, organization_data: OrganizationCreate, created_by: str
    ) -> Organization:
        """Create a new organization"""
        # Check if domain already exists
        existing_org = await db.execute(
            select(Organization).where(Organization.domain == organization_data.domain)
        )
        if existing_org.scalar_one_or_none():
            raise HTTPException(
                status_code=400, detail="Organization with this domain already exists"
            )

        # Create organization
        organization = Organization(
            **organization_data.model_dump(), created_by=created_by
        )
        db.add(organization)
        await db.commit()
        await db.refresh(organization)
        return organization

    @staticmethod
    async def get_by_id(
        db: AsyncSession, organization_id: str
    ) -> Optional[Organization]:
        """Get organization by ID"""
        result = await db.execute(
            select(Organization)
            .options(selectinload(Organization.creator))
            .where(Organization.id == organization_id)
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def get_by_domain(db: AsyncSession, domain: str) -> Optional[Organization]:
        """Get organization by domain"""
        result = await db.execute(
            select(Organization)
            .options(selectinload(Organization.creator))
            .where(Organization.domain == domain)
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def get_user_organizations(
        db: AsyncSession, user_id: str, skip: int = 0, limit: int = 100
    ) -> tuple[List[Organization], int]:
        """Get all organizations created by a user with pagination"""
        # Get total count
        total_result = await db.execute(
            select(func.count(Organization.id)).where(
                Organization.created_by == user_id
            )
        )
        total = total_result.scalar()

        # Get organizations with pagination
        result = await db.execute(
            select(Organization)
            .options(selectinload(Organization.creator))
            .where(Organization.created_by == user_id)
            .order_by(Organization.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        organizations = result.scalars().all()

        return list(organizations), total

    @staticmethod
    async def update(
        db: AsyncSession, organization_id: str, organization_update: OrganizationUpdate
    ) -> Optional[Organization]:
        """Update organization"""
        organization = await OrganizationService.get_by_id(db, organization_id)
        if not organization:
            return None

        # Check if domain is being updated and if it already exists
        if (
            organization_update.domain
            and organization_update.domain != organization.domain
        ):
            existing_org = await OrganizationService.get_by_domain(
                db, organization_update.domain
            )
            if existing_org:
                raise HTTPException(
                    status_code=400,
                    detail="Organization with this domain already exists",
                )

        # Update fields
        update_data = organization_update.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(organization, field, value)

        await db.commit()
        await db.refresh(organization)
        return organization

    @staticmethod
    async def delete(db: AsyncSession, organization_id: str) -> bool:
        """Delete organization (soft delete by setting is_active to False)"""
        organization = await OrganizationService.get_by_id(db, organization_id)
        if not organization:
            return False

        organization.is_active = False
        await db.commit()
        return True

    @staticmethod
    async def can_user_manage_organization(
        db: AsyncSession, user_id: str, organization_id: str
    ) -> bool:
        """Check if user can manage the organization (creator or admin)"""
        # Get user
        user_result = await db.execute(select(User).where(User.id == user_id))
        user = user_result.scalar_one_or_none()

        if not user:
            return False

        # Admin can manage any organization
        if user.role == UserRole.ADMIN:
            return True

        # Creator can manage their own organization
        organization = await OrganizationService.get_by_id(db, organization_id)
        if organization and organization.created_by == user_id:
            return True

        return False
