from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_, desc, asc
from sqlalchemy.orm import selectinload
from typing import List, Optional, Tuple
from datetime import datetime
from app.models.screenshot import Screenshot
from app.models.employee import Employee
from app.models.organization import Organization
from app.models.time_tracking import TimeTracking
from app.models.task import Task
from app.models.project import Project
from app.models.user import User, UserRole
from app.schemas.screenshot import (
    ScreenshotCreate,
    ScreenshotUpdate,
    ScreenshotFilters,
    ScreenshotUploadRequest,
)
from fastapi import HTTPException


class ScreenshotService:
    @staticmethod
    async def create_screenshot(
        db: AsyncSession, screenshot_data: ScreenshotCreate
    ) -> Screenshot:
        """Create a new screenshot record"""
        # Check if employee exists and is active
        employee = await db.execute(
            select(Employee).where(
                and_(
                    Employee.id == screenshot_data.employee_id,
                    Employee.is_active == True,
                )
            )
        )
        employee = employee.scalar_one_or_none()

        if not employee:
            raise HTTPException(
                status_code=404, detail="Employee not found or inactive"
            )

        # Check if organization exists and is active
        organization = await db.execute(
            select(Organization).where(
                and_(
                    Organization.id == screenshot_data.organization_id,
                    Organization.is_active == True,
                )
            )
        )
        organization = organization.scalar_one_or_none()

        if not organization:
            raise HTTPException(
                status_code=404, detail="Organization not found or inactive"
            )

        # Validate time tracking session if provided
        if screenshot_data.tracking_id:
            time_tracking = await db.execute(
                select(TimeTracking).where(
                    and_(
                        TimeTracking.id == screenshot_data.tracking_id,
                        TimeTracking.employee_id == screenshot_data.employee_id,
                        TimeTracking.is_active == True,
                    )
                )
            )
            if not time_tracking.scalar_one_or_none():
                raise HTTPException(
                    status_code=404, detail="Time tracking session not found or invalid"
                )

        # Validate project if provided
        if screenshot_data.project_id:
            project = await db.execute(
                select(Project).where(
                    and_(
                        Project.id == screenshot_data.project_id,
                        Project.is_active == True,
                    )
                )
            )
            if not project.scalar_one_or_none():
                raise HTTPException(
                    status_code=404, detail="Project not found or inactive"
                )

        # Validate task if provided
        if screenshot_data.task_id:
            task = await db.execute(
                select(Task).where(
                    and_(Task.id == screenshot_data.task_id, Task.is_active == True)
                )
            )
            if not task.scalar_one_or_none():
                raise HTTPException(
                    status_code=404, detail="Task not found or inactive"
                )

        screenshot = Screenshot(
            employee_id=screenshot_data.employee_id,
            organization_id=screenshot_data.organization_id,
            tracking_id=screenshot_data.tracking_id,
            project_id=screenshot_data.project_id,
            task_id=screenshot_data.task_id,
            path=screenshot_data.path,
            permission=screenshot_data.permission,
            os=screenshot_data.os,
            geo_location=screenshot_data.geo_location,
            ip_address=screenshot_data.ip_address,
            app=screenshot_data.app,
        )

        db.add(screenshot)
        await db.commit()
        await db.refresh(screenshot)

        return screenshot

    @staticmethod
    async def upload_screenshot(
        db: AsyncSession, upload_data: ScreenshotUploadRequest
    ) -> Screenshot:
        """Upload a screenshot from client desktop app"""
        # Convert upload request to create request
        create_data = ScreenshotCreate(
            employee_id=upload_data.employee_id,
            organization_id=upload_data.organization_id,
            tracking_id=upload_data.tracking_id,
            project_id=upload_data.project_id,
            task_id=upload_data.task_id,
            path=upload_data.path,
            permission=upload_data.permission,
            os=upload_data.os,
            geo_location=upload_data.geo_location,
            ip_address=upload_data.ip_address,
            app=upload_data.app,
        )

        return await ScreenshotService.create_screenshot(db, create_data)

    @staticmethod
    async def get_screenshot(
        db: AsyncSession, screenshot_id: str
    ) -> Optional[Screenshot]:
        """Get a screenshot by ID"""
        result = await db.execute(
            select(Screenshot)
            .options(selectinload(Screenshot.employee))
            .options(selectinload(Screenshot.organization))
            .options(selectinload(Screenshot.time_tracking))
            .options(selectinload(Screenshot.project))
            .options(selectinload(Screenshot.task))
            .where(Screenshot.id == screenshot_id)
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def get_employee_screenshots(
        db: AsyncSession,
        employee_id: str,
        filters: ScreenshotFilters,
        skip: int = 0,
        limit: int = 100,
    ) -> Tuple[List[Screenshot], int]:
        """Get screenshots for an employee with filters"""
        query = select(Screenshot).where(Screenshot.employee_id == employee_id)

        # Apply filters
        if filters.tracking_id:
            query = query.where(Screenshot.tracking_id == filters.tracking_id)

        if filters.project_id:
            query = query.where(Screenshot.project_id == filters.project_id)

        if filters.task_id:
            query = query.where(Screenshot.task_id == filters.task_id)

        if filters.permission is not None:
            query = query.where(Screenshot.permission == filters.permission)

        if filters.app:
            query = query.where(Screenshot.app.ilike(f"%{filters.app}%"))

        if filters.os:
            query = query.where(Screenshot.os.ilike(f"%{filters.os}%"))

        if filters.start_date:
            query = query.where(Screenshot.created_at >= filters.start_date)

        if filters.end_date:
            query = query.where(Screenshot.created_at <= filters.end_date)

        # Get total count
        count_query = select(func.count()).select_from(query.subquery())
        total = await db.scalar(count_query)

        # Apply sorting
        if filters.sort_by == "created_at":
            sort_column = Screenshot.created_at
        elif filters.sort_by == "updated_at":
            sort_column = Screenshot.updated_at
        elif filters.sort_by == "app":
            sort_column = Screenshot.app
        else:
            sort_column = Screenshot.created_at

        if filters.sort_order.lower() == "asc":
            query = query.order_by(asc(sort_column))
        else:
            query = query.order_by(desc(sort_column))

        # Apply pagination
        query = query.offset(skip).limit(limit)

        # Add relationships
        query = query.options(selectinload(Screenshot.employee))
        query = query.options(selectinload(Screenshot.organization))
        query = query.options(selectinload(Screenshot.time_tracking))
        query = query.options(selectinload(Screenshot.project))
        query = query.options(selectinload(Screenshot.task))

        result = await db.execute(query)
        screenshots = result.scalars().all()

        return list(screenshots), total

    @staticmethod
    async def get_organization_screenshots(
        db: AsyncSession,
        organization_id: str,
        filters: ScreenshotFilters,
        skip: int = 0,
        limit: int = 100,
    ) -> Tuple[List[Screenshot], int]:
        """Get screenshots for an organization with filters"""
        query = select(Screenshot).where(Screenshot.organization_id == organization_id)

        # Apply filters
        if filters.employee_id:
            query = query.where(Screenshot.employee_id == filters.employee_id)

        if filters.tracking_id:
            query = query.where(Screenshot.tracking_id == filters.tracking_id)

        if filters.project_id:
            query = query.where(Screenshot.project_id == filters.project_id)

        if filters.task_id:
            query = query.where(Screenshot.task_id == filters.task_id)

        if filters.permission is not None:
            query = query.where(Screenshot.permission == filters.permission)

        if filters.app:
            query = query.where(Screenshot.app.ilike(f"%{filters.app}%"))

        if filters.os:
            query = query.where(Screenshot.os.ilike(f"%{filters.os}%"))

        if filters.start_date:
            query = query.where(Screenshot.created_at >= filters.start_date)

        if filters.end_date:
            query = query.where(Screenshot.created_at <= filters.end_date)

        # Get total count
        count_query = select(func.count()).select_from(query.subquery())
        total = await db.scalar(count_query)

        # Apply sorting
        if filters.sort_by == "created_at":
            sort_column = Screenshot.created_at
        elif filters.sort_by == "updated_at":
            sort_column = Screenshot.updated_at
        elif filters.sort_by == "app":
            sort_column = Screenshot.app
        else:
            sort_column = Screenshot.created_at

        if filters.sort_order.lower() == "asc":
            query = query.order_by(asc(sort_column))
        else:
            query = query.order_by(desc(sort_column))

        # Apply pagination
        query = query.offset(skip).limit(limit)

        # Add relationships
        query = query.options(selectinload(Screenshot.employee))
        query = query.options(selectinload(Screenshot.organization))
        query = query.options(selectinload(Screenshot.time_tracking))
        query = query.options(selectinload(Screenshot.project))
        query = query.options(selectinload(Screenshot.task))

        result = await db.execute(query)
        screenshots = result.scalars().all()

        return list(screenshots), total

    @staticmethod
    async def get_project_screenshots(
        db: AsyncSession,
        project_id: str,
        filters: ScreenshotFilters,
        skip: int = 0,
        limit: int = 100,
    ) -> Tuple[List[Screenshot], int]:
        """Get screenshots for a project with filters"""
        query = select(Screenshot).where(Screenshot.project_id == project_id)

        # Apply filters
        if filters.employee_id:
            query = query.where(Screenshot.employee_id == filters.employee_id)

        if filters.organization_id:
            query = query.where(Screenshot.organization_id == filters.organization_id)

        if filters.tracking_id:
            query = query.where(Screenshot.tracking_id == filters.tracking_id)

        if filters.task_id:
            query = query.where(Screenshot.task_id == filters.task_id)

        if filters.permission is not None:
            query = query.where(Screenshot.permission == filters.permission)

        if filters.app:
            query = query.where(Screenshot.app.ilike(f"%{filters.app}%"))

        if filters.os:
            query = query.where(Screenshot.os.ilike(f"%{filters.os}%"))

        if filters.start_date:
            query = query.where(Screenshot.created_at >= filters.start_date)

        if filters.end_date:
            query = query.where(Screenshot.created_at <= filters.end_date)

        # Get total count
        count_query = select(func.count()).select_from(query.subquery())
        total = await db.scalar(count_query)

        # Apply sorting
        if filters.sort_by == "created_at":
            sort_column = Screenshot.created_at
        elif filters.sort_by == "updated_at":
            sort_column = Screenshot.updated_at
        elif filters.sort_by == "app":
            sort_column = Screenshot.app
        else:
            sort_column = Screenshot.created_at

        if filters.sort_order.lower() == "asc":
            query = query.order_by(asc(sort_column))
        else:
            query = query.order_by(desc(sort_column))

        # Apply pagination
        query = query.offset(skip).limit(limit)

        # Add relationships
        query = query.options(selectinload(Screenshot.employee))
        query = query.options(selectinload(Screenshot.organization))
        query = query.options(selectinload(Screenshot.time_tracking))
        query = query.options(selectinload(Screenshot.project))
        query = query.options(selectinload(Screenshot.task))

        result = await db.execute(query)
        screenshots = result.scalars().all()

        return list(screenshots), total

    @staticmethod
    async def get_task_screenshots(
        db: AsyncSession,
        task_id: str,
        filters: ScreenshotFilters,
        skip: int = 0,
        limit: int = 100,
    ) -> Tuple[List[Screenshot], int]:
        """Get screenshots for a task with filters"""
        query = select(Screenshot).where(Screenshot.task_id == task_id)

        # Apply filters
        if filters.employee_id:
            query = query.where(Screenshot.employee_id == filters.employee_id)

        if filters.organization_id:
            query = query.where(Screenshot.organization_id == filters.organization_id)

        if filters.tracking_id:
            query = query.where(Screenshot.tracking_id == filters.tracking_id)

        if filters.project_id:
            query = query.where(Screenshot.project_id == filters.project_id)

        if filters.permission is not None:
            query = query.where(Screenshot.permission == filters.permission)

        if filters.app:
            query = query.where(Screenshot.app.ilike(f"%{filters.app}%"))

        if filters.os:
            query = query.where(Screenshot.os.ilike(f"%{filters.os}%"))

        if filters.start_date:
            query = query.where(Screenshot.created_at >= filters.start_date)

        if filters.end_date:
            query = query.where(Screenshot.created_at <= filters.end_date)

        # Get total count
        count_query = select(func.count()).select_from(query.subquery())
        total = await db.scalar(count_query)

        # Apply sorting
        if filters.sort_by == "created_at":
            sort_column = Screenshot.created_at
        elif filters.sort_by == "updated_at":
            sort_column = Screenshot.updated_at
        elif filters.sort_by == "app":
            sort_column = Screenshot.app
        else:
            sort_column = Screenshot.created_at

        if filters.sort_order.lower() == "asc":
            query = query.order_by(asc(sort_column))
        else:
            query = query.order_by(desc(sort_column))

        # Apply pagination
        query = query.offset(skip).limit(limit)

        # Add relationships
        query = query.options(selectinload(Screenshot.employee))
        query = query.options(selectinload(Screenshot.organization))
        query = query.options(selectinload(Screenshot.time_tracking))
        query = query.options(selectinload(Screenshot.project))
        query = query.options(selectinload(Screenshot.task))

        result = await db.execute(query)
        screenshots = result.scalars().all()

        return list(screenshots), total

    @staticmethod
    async def update_screenshot(
        db: AsyncSession,
        screenshot_id: str,
        update_data: ScreenshotUpdate,
    ) -> Optional[Screenshot]:
        """Update a screenshot"""
        screenshot = await ScreenshotService.get_screenshot(db, screenshot_id)

        if not screenshot:
            raise HTTPException(status_code=404, detail="Screenshot not found")

        # Update fields
        for field, value in update_data.model_dump(exclude_unset=True).items():
            setattr(screenshot, field, value)

        await db.commit()
        await db.refresh(screenshot)

        return screenshot

    @staticmethod
    async def delete_screenshot(db: AsyncSession, screenshot_id: str) -> bool:
        """Delete a screenshot"""
        screenshot = await ScreenshotService.get_screenshot(db, screenshot_id)

        if not screenshot:
            raise HTTPException(status_code=404, detail="Screenshot not found")

        await db.delete(screenshot)
        await db.commit()

        return True

    @staticmethod
    async def can_user_manage_screenshot(
        db: AsyncSession, user_id: str, screenshot_id: str
    ) -> bool:
        """Check if user can manage a screenshot"""
        user = await db.execute(select(User).where(User.id == user_id))
        user = user.scalar_one_or_none()

        if not user:
            return False

        if user.role == UserRole.ADMIN:
            return True

        # Check if user is the employee who owns the screenshot
        screenshot = await db.execute(
            select(Screenshot).where(Screenshot.id == screenshot_id)
        )
        screenshot = screenshot.scalar_one_or_none()

        if not screenshot:
            return False

        return screenshot.employee_id == user_id
