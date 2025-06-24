from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from sqlalchemy.orm import selectinload
from typing import List, Optional
from app.models.task import Task, task_employees
from app.models.employee import Employee
from app.models.project import Project
from app.models.organization import Organization
from app.models.user import User, UserRole
from app.schemas.task import TaskCreate, TaskUpdate
from fastapi import HTTPException


class TaskService:
    @staticmethod
    async def create(
        db: AsyncSession, task_data: TaskCreate, created_by_user_id: str
    ) -> Task:
        """Create a new task"""
        # Check if task code already exists in the same project
        existing_task = await db.execute(
            select(Task).where(
                and_(
                    Task.code == task_data.code, Task.project_id == task_data.project_id
                )
            )
        )
        if existing_task.scalar_one_or_none():
            raise HTTPException(
                status_code=400,
                detail="Task with this code already exists in this project",
            )

        # Verify project exists and user has permission
        project = await db.execute(
            select(Project).where(Project.id == task_data.project_id)
        )
        project = project.scalar_one_or_none()

        if not project:
            raise HTTPException(status_code=404, detail="Project not found")

        # Check if user has permission to create tasks in this project
        can_manage = await TaskService.can_user_manage_project(
            db=db, user_id=created_by_user_id, project_id=task_data.project_id
        )

        if not can_manage:
            raise HTTPException(
                status_code=403,
                detail="You don't have permission to create tasks in this project",
            )

        # If this is a default task, ensure only one default task per project
        if task_data.is_default:
            existing_default = await db.execute(
                select(Task).where(
                    and_(
                        Task.project_id == task_data.project_id,
                        Task.is_default == True,
                        Task.is_active == True,
                    )
                )
            )
            if existing_default.scalar_one_or_none():
                raise HTTPException(
                    status_code=400,
                    detail="A default task already exists for this project",
                )

        # Create task
        task = Task(**task_data.model_dump())
        db.add(task)
        await db.commit()
        await db.refresh(task)
        return task

    @staticmethod
    async def create_default_task(
        db: AsyncSession, project_id: str, task_data: dict, created_by_user_id: str
    ) -> Task:
        """Create a default task for a project"""
        # Verify project exists and user has permission
        project = await db.execute(select(Project).where(Project.id == project_id))
        project = project.scalar_one_or_none()

        if not project:
            raise HTTPException(status_code=404, detail="Project not found")

        # Check if user has permission to create tasks in this project
        can_manage = await TaskService.can_user_manage_project(
            db=db, user_id=created_by_user_id, project_id=project_id
        )

        if not can_manage:
            raise HTTPException(
                status_code=403,
                detail="You don't have permission to create tasks in this project",
            )

        # Check if default task already exists
        existing_default = await db.execute(
            select(Task).where(
                and_(
                    Task.project_id == project_id,
                    Task.is_default == True,
                    Task.is_active == True,
                )
            )
        )
        if existing_default.scalar_one_or_none():
            raise HTTPException(
                status_code=400, detail="A default task already exists for this project"
            )

        # Create default task
        task = Task(
            name=task_data["name"],
            description=task_data.get("description"),
            code="DEFAULT",
            project_id=project_id,
            is_default=True,
            is_active=True,
        )
        db.add(task)
        await db.commit()
        await db.refresh(task)
        return task

    @staticmethod
    async def get_by_id(db: AsyncSession, task_id: str) -> Optional[Task]:
        """Get task by ID"""
        result = await db.execute(
            select(Task)
            .options(
                selectinload(Task.project).selectinload(Project.organization),
                selectinload(Task.employees),
            )
            .where(Task.id == task_id)
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def get_by_code(
        db: AsyncSession, code: str, project_id: str
    ) -> Optional[Task]:
        """Get task by code within a project"""
        result = await db.execute(
            select(Task)
            .options(
                selectinload(Task.project).selectinload(Project.organization),
                selectinload(Task.employees),
            )
            .where(and_(Task.code == code, Task.project_id == project_id))
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def get_project_tasks(
        db: AsyncSession, project_id: str, skip: int = 0, limit: int = 100
    ) -> tuple[List[Task], int]:
        """Get all tasks in a project with pagination"""
        # Get total count
        total_result = await db.execute(
            select(func.count(Task.id)).where(Task.project_id == project_id)
        )
        total = total_result.scalar()

        # Get tasks with pagination
        result = await db.execute(
            select(Task)
            .options(
                selectinload(Task.project).selectinload(Project.organization),
                selectinload(Task.employees),
            )
            .where(Task.project_id == project_id)
            .order_by(Task.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        tasks = result.scalars().all()

        return list(tasks), total

    @staticmethod
    async def get_organization_tasks(
        db: AsyncSession, organization_id: str, skip: int = 0, limit: int = 100
    ) -> tuple[List[Task], int]:
        """Get all tasks in an organization with pagination"""
        # Get total count
        total_result = await db.execute(
            select(func.count(Task.id))
            .join(Project, Task.project_id == Project.id)
            .where(Project.organization_id == organization_id)
        )
        total = total_result.scalar()

        # Get tasks with pagination
        result = await db.execute(
            select(Task)
            .options(
                selectinload(Task.project).selectinload(Project.organization),
                selectinload(Task.employees),
            )
            .join(Project, Task.project_id == Project.id)
            .where(Project.organization_id == organization_id)
            .order_by(Task.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        tasks = result.scalars().all()

        return list(tasks), total

    @staticmethod
    async def update(
        db: AsyncSession, task_id: str, task_update: TaskUpdate, updated_by_user_id: str
    ) -> Optional[Task]:
        """Update task"""
        task = await TaskService.get_by_id(db, task_id)
        if not task:
            return None

        # Check if user has permission to update this task
        can_manage = await TaskService.can_user_manage_project(
            db=db, user_id=updated_by_user_id, project_id=task.project_id
        )

        if not can_manage:
            raise HTTPException(
                status_code=403,
                detail="You don't have permission to update this task",
            )

        # Check if code is being updated and if it already exists in the same project
        if task_update.code and task_update.code != task.code:
            existing_task = await TaskService.get_by_code(
                db, task_update.code, task.project_id
            )
            if existing_task:
                raise HTTPException(
                    status_code=400,
                    detail="Task with this code already exists in this project",
                )

        # If making this task default, ensure no other default task exists
        if task_update.is_default and not task.is_default:
            existing_default = await db.execute(
                select(Task).where(
                    and_(
                        Task.project_id == task.project_id,
                        Task.is_default == True,
                        Task.is_active == True,
                        Task.id != task_id,
                    )
                )
            )
            if existing_default.scalar_one_or_none():
                raise HTTPException(
                    status_code=400,
                    detail="A default task already exists for this project",
                )

        # Update fields
        update_data = task_update.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(task, field, value)

        await db.commit()
        await db.refresh(task)
        return task

    @staticmethod
    async def delete(db: AsyncSession, task_id: str, deleted_by_user_id: str) -> bool:
        """Delete task (soft delete by setting is_active to False)"""
        task = await TaskService.get_by_id(db, task_id)
        if not task:
            return False

        # Check if user has permission to delete this task
        can_manage = await TaskService.can_user_manage_project(
            db=db, user_id=deleted_by_user_id, project_id=task.project_id
        )

        if not can_manage:
            raise HTTPException(
                status_code=403,
                detail="You don't have permission to delete this task",
            )

        # Don't allow deletion of default tasks
        if task.is_default:
            raise HTTPException(
                status_code=400,
                detail="Cannot delete the default task. Archive it instead.",
            )

        task.is_active = False
        await db.commit()
        return True

    @staticmethod
    async def assign_employees(
        db: AsyncSession,
        task_id: str,
        employee_ids: List[str],
        assigned_by_user_id: str,
    ) -> bool:
        """Assign employees to a task"""
        task = await TaskService.get_by_id(db, task_id)
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")

        # Check if user has permission to manage this task
        can_manage = await TaskService.can_user_manage_project(
            db=db, user_id=assigned_by_user_id, project_id=task.project_id
        )

        if not can_manage:
            raise HTTPException(
                status_code=403,
                detail="You don't have permission to assign employees to this task",
            )

        # Verify all employees exist and belong to the same organization
        employees = await db.execute(
            select(Employee).where(
                and_(
                    Employee.id.in_(employee_ids),
                    Employee.organization_id == task.project.organization_id,
                )
            )
        )
        employees = employees.scalars().all()

        if len(employees) != len(employee_ids):
            raise HTTPException(
                status_code=400,
                detail="Some employees not found or don't belong to this organization",
            )

        # Assign employees to task
        for employee in employees:
            # Check if already assigned
            existing_assignment = await db.execute(
                select(task_employees).where(
                    and_(
                        task_employees.c.task_id == task_id,
                        task_employees.c.employee_id == employee.id,
                        task_employees.c.is_active == True,
                    )
                )
            )

            if not existing_assignment.scalar_one_or_none():
                # Insert new assignment
                await db.execute(
                    task_employees.insert().values(
                        task_id=task_id, employee_id=employee.id, is_active=True
                    )
                )

        await db.commit()
        return True

    @staticmethod
    async def remove_employees(
        db: AsyncSession, task_id: str, employee_ids: List[str], removed_by_user_id: str
    ) -> bool:
        """Remove employees from a task"""
        task = await TaskService.get_by_id(db, task_id)
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")

        # Check if user has permission to manage this task
        can_manage = await TaskService.can_user_manage_project(
            db=db, user_id=removed_by_user_id, project_id=task.project_id
        )

        if not can_manage:
            raise HTTPException(
                status_code=403,
                detail="You don't have permission to remove employees from this task",
            )

        # Remove employees from task (soft delete by setting is_active to False)
        await db.execute(
            task_employees.delete().where(
                and_(
                    task_employees.c.task_id == task_id,
                    task_employees.c.employee_id.in_(employee_ids),
                )
            )
        )

        await db.commit()
        return True

    @staticmethod
    async def get_task_employees(db: AsyncSession, task_id: str) -> List[Employee]:
        """Get all employees assigned to a task"""
        result = await db.execute(
            select(Employee)
            .join(task_employees, Employee.id == task_employees.c.employee_id)
            .where(
                and_(
                    task_employees.c.task_id == task_id,
                    task_employees.c.is_active == True,
                )
            )
        )
        return result.scalars().all()

    @staticmethod
    async def get_employee_tasks(
        db: AsyncSession, employee_id: str, skip: int = 0, limit: int = 100
    ) -> tuple[List[Task], int]:
        """Get all tasks assigned to an employee with pagination"""
        # Get total count
        total_result = await db.execute(
            select(func.count(Task.id))
            .join(task_employees, Task.id == task_employees.c.task_id)
            .where(
                and_(
                    task_employees.c.employee_id == employee_id,
                    task_employees.c.is_active == True,
                    Task.is_active == True,
                )
            )
        )
        total = total_result.scalar()

        # Get tasks with pagination
        result = await db.execute(
            select(Task)
            .options(
                selectinload(Task.project).selectinload(Project.organization),
                selectinload(Task.employees),
            )
            .join(task_employees, Task.id == task_employees.c.task_id)
            .where(
                and_(
                    task_employees.c.employee_id == employee_id,
                    task_employees.c.is_active == True,
                    Task.is_active == True,
                )
            )
            .order_by(Task.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        tasks = result.scalars().all()

        return list(tasks), total

    @staticmethod
    async def can_user_manage_project(
        db: AsyncSession, user_id: str, project_id: str
    ) -> bool:
        """Check if user can manage the project (admin or organization creator)"""
        # Get user
        user_result = await db.execute(select(User).where(User.id == user_id))
        user = user_result.scalar_one_or_none()

        if not user:
            return False

        # Admin can manage any project
        if user.role == UserRole.ADMIN:
            return True

        # Get project with organization info
        project_result = await db.execute(
            select(Project)
            .options(selectinload(Project.organization))
            .where(Project.id == project_id)
        )
        project = project_result.scalar_one_or_none()

        if not project:
            return False

        # Organization creator can manage projects in their organization
        if project.organization.created_by == user_id:
            return True

        return False
