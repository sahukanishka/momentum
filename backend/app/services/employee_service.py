from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from typing import List, Optional
from app.models.employee import Employee
from app.models.organization import Organization
from app.models.user import User, UserRole
from app.schemas.employee import EmployeeCreate, EmployeeUpdate
from app.core.security import Security
from app.core.mail import MailService
from fastapi import HTTPException
import os


class EmployeeService:
    @staticmethod
    async def create(
        db: AsyncSession, employee_data: EmployeeCreate, created_by_user_id: str
    ) -> Employee:
        """Create a new employee"""
        existing_employee = await db.execute(
            select(Employee).where(Employee.email == employee_data.email)
        )
        if existing_employee.scalar_one_or_none():
            raise HTTPException(
                status_code=400, detail="Employee with this email already exists"
            )

        organization = await db.execute(
            select(Organization).where(Organization.id == employee_data.organization_id)
        )
        organization = organization.scalar_one_or_none()

        if not organization:
            raise HTTPException(status_code=404, detail="Organization not found")

        can_manage = await EmployeeService.can_user_manage_organization(
            db=db,
            user_id=created_by_user_id,
            organization_id=employee_data.organization_id,
        )

        if not can_manage:
            raise HTTPException(
                status_code=403,
                detail="You don't have permission to add employees to this organization",
            )

        hashed_password = Security.get_password_hash(employee_data.password)

        employee = Employee(
            name=employee_data.name,
            email=employee_data.email,
            hashed_password=hashed_password,
            organization_id=employee_data.organization_id,
        )

        db.add(employee)
        await db.commit()
        await db.refresh(employee)

        try:
            mail_service = MailService()
            login_url = f"{os.getenv('DOMAIN_URL', 'http://localhost:3000')}/login"
            await mail_service.send_login_credentials_email(
                to_email=employee_data.email,
                name=employee_data.name,
                login_url=login_url,
                password=employee_data.password,
            )
        except Exception as e:
            print(f"Failed to send welcome email: {str(e)}")

        return employee

    @staticmethod
    async def get_by_id(db: AsyncSession, employee_id: str) -> Optional[Employee]:
        """Get employee by ID"""
        result = await db.execute(
            select(Employee)
            .options(selectinload(Employee.organization))
            .where(Employee.id == employee_id)
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def get_by_email(db: AsyncSession, email: str) -> Optional[Employee]:
        """Get employee by email"""
        result = await db.execute(
            select(Employee)
            .options(selectinload(Employee.organization))
            .where(Employee.email == email)
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def get_organization_employees(
        db: AsyncSession, organization_id: str, skip: int = 0, limit: int = 100
    ) -> tuple[List[Employee], int]:
        """Get all employees in an organization with pagination"""
        total_result = await db.execute(
            select(func.count(Employee.id)).where(
                Employee.organization_id == organization_id
            )
        )
        total = total_result.scalar()

        result = await db.execute(
            select(Employee)
            .options(selectinload(Employee.organization))
            .where(Employee.organization_id == organization_id)
            .order_by(Employee.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        employees = result.scalars().all()

        return list(employees), total

    @staticmethod
    async def update(
        db: AsyncSession,
        employee_id: str,
        employee_update: EmployeeUpdate,
        updated_by_user_id: str,
    ) -> Optional[Employee]:
        """Update employee"""
        employee = await EmployeeService.get_by_id(db, employee_id)
        if not employee:
            return None

        can_manage = await EmployeeService.can_user_manage_organization(
            db=db, user_id=updated_by_user_id, organization_id=employee.organization_id
        )

        if not can_manage:
            raise HTTPException(
                status_code=403,
                detail="You don't have permission to update this employee",
            )

        if employee_update.email and employee_update.email != employee.email:
            existing_employee = await EmployeeService.get_by_email(
                db, employee_update.email
            )
            if existing_employee:
                raise HTTPException(
                    status_code=400,
                    detail="Employee with this email already exists",
                )

        update_data = employee_update.model_dump(exclude_unset=True)

        if "password" in update_data:
            update_data["hashed_password"] = Security.get_password_hash(
                update_data.pop("password")
            )

        for field, value in update_data.items():
            setattr(employee, field, value)

        await db.commit()
        await db.refresh(employee)
        return employee

    @staticmethod
    async def delete(
        db: AsyncSession, employee_id: str, deleted_by_user_id: str
    ) -> bool:
        """Delete employee (soft delete by setting is_active to False)"""
        employee = await EmployeeService.get_by_id(db, employee_id)
        if not employee:
            return False

        can_manage = await EmployeeService.can_user_manage_organization(
            db=db, user_id=deleted_by_user_id, organization_id=employee.organization_id
        )

        if not can_manage:
            raise HTTPException(
                status_code=403,
                detail="You don't have permission to delete this employee",
            )

        employee.is_active = False
        await db.commit()
        return True

    @staticmethod
    async def deactivate(
        db: AsyncSession, employee_id: str, deactivated_by_user_id: str
    ) -> bool:
        """Deactivate employee (set is_active to False)"""
        employee = await EmployeeService.get_by_id(db, employee_id)
        if not employee:
            return False

        can_manage = await EmployeeService.can_user_manage_organization(
            db=db,
            user_id=deactivated_by_user_id,
            organization_id=employee.organization_id,
        )

        if not can_manage:
            raise HTTPException(
                status_code=403,
                detail="You don't have permission to deactivate this employee",
            )

        employee.is_active = False
        await db.commit()
        return True

    @staticmethod
    async def activate(
        db: AsyncSession, employee_id: str, activated_by_user_id: str
    ) -> bool:
        """Activate employee (set is_active to True)"""
        employee = await EmployeeService.get_by_id(db, employee_id)
        if not employee:
            return False

        can_manage = await EmployeeService.can_user_manage_organization(
            db=db,
            user_id=activated_by_user_id,
            organization_id=employee.organization_id,
        )

        if not can_manage:
            raise HTTPException(
                status_code=403,
                detail="You don't have permission to activate this employee",
            )

        employee.is_active = True
        await db.commit()
        return True

    @staticmethod
    async def can_user_manage_organization(
        db: AsyncSession, user_id: str, organization_id: str
    ) -> bool:
        """Check if user can manage the organization (creator or admin)"""
        user_result = await db.execute(select(User).where(User.id == user_id))
        user = user_result.scalar_one_or_none()

        if not user:
            return False

        if user.role == UserRole.ADMIN:
            return True

        organization = await db.execute(
            select(Organization).where(Organization.id == organization_id)
        )
        organization = organization.scalar_one_or_none()

        if organization and organization.created_by == user_id:
            return True

        return False
