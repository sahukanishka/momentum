# app/services/project_service.py
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from sqlalchemy.orm import selectinload
from typing import List, Optional
from app.models.project import Project, project_employees
from app.models.employee import Employee
from app.models.organization import Organization
from app.models.user import User, UserRole
from app.schemas.project import ProjectCreate, ProjectResponse, ProjectUpdate
from fastapi import HTTPException


class ProjectService:
    @staticmethod
    async def create(
        db: AsyncSession, project_data: ProjectCreate, created_by_user_id: str
    ) -> Project:
        """Create a new project"""
        existing_project = await db.execute(
            select(Project).where(Project.code == project_data.code)
        )
        if existing_project.scalar_one_or_none():
            raise HTTPException(
                status_code=400, detail="Project with this code already exists"
            )

        organization = await db.execute(
            select(Organization).where(Organization.id == project_data.organization_id)
        )
        organization = organization.scalar_one_or_none()

        if not organization:
            raise HTTPException(status_code=404, detail="Organization not found")

        can_manage = await ProjectService.can_user_manage_organization(
            db=db,
            user_id=created_by_user_id,
            organization_id=project_data.organization_id,
        )

        if not can_manage:
            raise HTTPException(
                status_code=403,
                detail="You don't have permission to create projects in this organization",
            )

        project = Project(**project_data.model_dump())
        db.add(project)
        await db.commit()
        await db.refresh(project)
        return ProjectResponse.model_validate(project) if project else None

    @staticmethod
    async def get_by_id(db: AsyncSession, project_id: str) -> Optional[Project]:
        """Get project by ID"""
        result = await db.execute(
            select(Project)
            .options(
                selectinload(Project.organization), selectinload(Project.employees)
            )
            .where(Project.id == project_id)
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def get_by_code(db: AsyncSession, code: str) -> Optional[Project]:
        """Get project by code"""
        result = await db.execute(
            select(Project)
            .options(
                selectinload(Project.organization), selectinload(Project.employees)
            )
            .where(Project.code == code)
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def get_organization_projects(
        db: AsyncSession, organization_id: str, skip: int = 0, limit: int = 100
    ) -> tuple[List[Project], int]:
        """Get all projects in an organization with pagination"""
        total_result = await db.execute(
            select(func.count(Project.id)).where(
                Project.organization_id == organization_id
            )
        )
        total = total_result.scalar()

        result = await db.execute(
            select(Project)
            .options(
                selectinload(Project.organization), selectinload(Project.employees)
            )
            .where(Project.organization_id == organization_id)
            .order_by(Project.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        projects = result.scalars().all()

        return list(projects), total

    @staticmethod
    async def update(
        db: AsyncSession,
        project_id: str,
        project_update: ProjectUpdate,
        updated_by_user_id: str,
    ) -> Optional[Project]:
        """Update project"""
        project = await ProjectService.get_by_id(db, project_id)
        if not project:
            return None

        can_manage = await ProjectService.can_user_manage_organization(
            db=db, user_id=updated_by_user_id, organization_id=project.organization_id
        )

        if not can_manage:
            raise HTTPException(
                status_code=403,
                detail="You don't have permission to update this project",
            )

        # Check if code is being updated and if it already exists
        if project_update.code and project_update.code != project.code:
            existing_project = await ProjectService.get_by_code(db, project_update.code)
            if existing_project:
                raise HTTPException(
                    status_code=400,
                    detail="Project with this code already exists",
                )

        update_data = project_update.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(project, field, value)

        await db.commit()
        await db.refresh(project)
        return project

    @staticmethod
    async def delete(
        db: AsyncSession, project_id: str, deleted_by_user_id: str
    ) -> bool:
        """Delete project (soft delete by setting is_active to False)"""
        project = await ProjectService.get_by_id(db, project_id)
        if not project:
            return False

        can_manage = await ProjectService.can_user_manage_organization(
            db=db, user_id=deleted_by_user_id, organization_id=project.organization_id
        )

        if not can_manage:
            raise HTTPException(
                status_code=403,
                detail="You don't have permission to delete this project",
            )

        project.is_active = False
        await db.commit()
        return True

    @staticmethod
    async def archive(
        db: AsyncSession, project_id: str, archived_by_user_id: str
    ) -> bool:
        """Archive project (set is_archived to True)"""
        project = await ProjectService.get_by_id(db, project_id)
        if not project:
            return False

        can_manage = await ProjectService.can_user_manage_organization(
            db=db, user_id=archived_by_user_id, organization_id=project.organization_id
        )

        if not can_manage:
            raise HTTPException(
                status_code=403,
                detail="You don't have permission to archive this project",
            )

        project.is_archived = True
        await db.commit()
        return True

    @staticmethod
    async def unarchive(
        db: AsyncSession, project_id: str, unarchived_by_user_id: str
    ) -> bool:
        """Unarchive project (set is_archived to False)"""
        project = await ProjectService.get_by_id(db, project_id)
        if not project:
            return False

        can_manage = await ProjectService.can_user_manage_organization(
            db=db,
            user_id=unarchived_by_user_id,
            organization_id=project.organization_id,
        )

        if not can_manage:
            raise HTTPException(
                status_code=403,
                detail="You don't have permission to unarchive this project",
            )

        project.is_archived = False
        await db.commit()
        return True

    @staticmethod
    async def assign_employees(
        db: AsyncSession,
        project_id: str,
        employee_ids: List[str],
        assigned_by_user_id: str,
    ) -> bool:
        """Assign employees to a project"""
        project = await ProjectService.get_by_id(db, project_id)
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")

        can_manage = await ProjectService.can_user_manage_organization(
            db=db, user_id=assigned_by_user_id, organization_id=project.organization_id
        )

        if not can_manage:
            raise HTTPException(
                status_code=403,
                detail="You don't have permission to assign employees to this project",
            )

        employees = await db.execute(
            select(Employee).where(
                and_(
                    Employee.id.in_(employee_ids),
                    Employee.organization_id == project.organization_id,
                )
            )
        )
        employees = employees.scalars().all()

        if len(employees) != len(employee_ids):
            raise HTTPException(
                status_code=400,
                detail="Some employees not found or don't belong to this organization",
            )

        for employee in employees:

            existing_assignment = await db.execute(
                select(project_employees).where(
                    and_(
                        project_employees.c.project_id == project_id,
                        project_employees.c.employee_id == employee.id,
                        project_employees.c.is_active == True,
                    )
                )
            )

            if not existing_assignment.scalar_one_or_none():
                # Insert new assignment
                await db.execute(
                    project_employees.insert().values(
                        project_id=project_id, employee_id=employee.id, is_active=True
                    )
                )

        await db.commit()
        return True

    @staticmethod
    async def remove_employees(
        db: AsyncSession,
        project_id: str,
        employee_ids: List[str],
        removed_by_user_id: str,
    ) -> bool:
        """Remove employees from a project"""
        project = await ProjectService.get_by_id(db, project_id)
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")

        can_manage = await ProjectService.can_user_manage_organization(
            db=db, user_id=removed_by_user_id, organization_id=project.organization_id
        )

        if not can_manage:
            raise HTTPException(
                status_code=403,
                detail="You don't have permission to remove employees from this project",
            )

        # Remove employees from project (soft delete by setting is_active to False)
        await db.execute(
            project_employees.delete().where(
                and_(
                    project_employees.c.project_id == project_id,
                    project_employees.c.employee_id.in_(employee_ids),
                )
            )
        )

        await db.commit()
        return True

    @staticmethod
    async def get_project_employees(
        db: AsyncSession, project_id: str
    ) -> List[Employee]:
        """Get all employees assigned to a project"""
        result = await db.execute(
            select(Employee)
            .join(project_employees, Employee.id == project_employees.c.employee_id)
            .where(
                and_(
                    project_employees.c.project_id == project_id,
                    project_employees.c.is_active == True,
                )
            )
        )
        return result.scalars().all()

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
