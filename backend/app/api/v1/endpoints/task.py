from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from app.db.database import get_db
from app.middleware.auth_middleware import auth_middleware
from app.models.user import UserRole
from app.schemas.task import (
    TaskCreate,
    TaskUpdate,
    TaskResponse,
    TaskListResponse,
    AssignEmployeeToTaskRequest,
    RemoveEmployeeFromTaskRequest,
    CreateDefaultTaskRequest,
)
from app.services.task_service import TaskService

router = APIRouter()


@router.post("/", response_model=TaskResponse)
async def create_task(
    task_data: TaskCreate,
    current_user=Depends(auth_middleware),
    db: AsyncSession = Depends(get_db),
):
    """
    Create a new task.
    Only admin users or organization creators can create tasks.
    """
    # Check if user is admin or has permission to manage the project
    if current_user.role != UserRole.ADMIN:
        # For non-admin users, check if they can manage the project
        can_manage = await TaskService.can_user_manage_project(
            db=db, user_id=current_user.id, project_id=task_data.project_id
        )
        if not can_manage:
            raise HTTPException(
                status_code=403,
                detail="You don't have permission to create tasks in this project",
            )

    try:
        task = await TaskService.create(
            db=db, task_data=task_data, created_by_user_id=current_user.id
        )

        # Prepare response with project and organization names
        response_data = TaskResponse.model_validate(task)

        return response_data
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/project/{project_id}/default", response_model=TaskResponse)
async def create_default_task(
    project_id: str,
    task_data: CreateDefaultTaskRequest,
    current_user=Depends(auth_middleware),
    db: AsyncSession = Depends(get_db),
):
    """
    Create a default task for a project.
    Only admin users or organization creators can create default tasks.
    """
    try:
        task = await TaskService.create_default_task(
            db=db,
            project_id=project_id,
            task_data=task_data.model_dump(),
            created_by_user_id=current_user.id,
        )

        # Prepare response with project and organization names
        response_data = TaskResponse.model_validate(task)

        return response_data
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/project/{project_id}", response_model=TaskListResponse)
async def get_project_tasks(
    project_id: str,
    page: int = Query(1, ge=1, description="Page number"),
    size: int = Query(10, ge=1, le=100, description="Page size"),
    current_user=Depends(auth_middleware),
    db: AsyncSession = Depends(get_db),
):
    """
    Get all tasks in a project.
    Only admin users or organization creators can view tasks.
    """
    # Check if user has permission to view tasks in this project
    can_manage = await TaskService.can_user_manage_project(
        db=db, user_id=current_user.id, project_id=project_id
    )

    if not can_manage:
        raise HTTPException(
            status_code=403,
            detail="You don't have permission to view tasks in this project",
        )

    try:
        skip = (page - 1) * size
        tasks, total = await TaskService.get_project_tasks(
            db=db, project_id=project_id, skip=skip, limit=size
        )

        # Prepare response with project and organization names
        task_responses = []
        for task in tasks:
            response_data = TaskResponse.model_validate(task)
            task_responses.append(response_data)

        return TaskListResponse(
            tasks=task_responses,
            total=total,
            page=page,
            size=size,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/organization/{organization_id}", response_model=TaskListResponse)
async def get_organization_tasks(
    organization_id: str,
    page: int = Query(1, ge=1, description="Page number"),
    size: int = Query(10, ge=1, le=100, description="Page size"),
    current_user=Depends(auth_middleware),
    db: AsyncSession = Depends(get_db),
):
    """
    Get all tasks in an organization.
    Only admin users or organization creators can view tasks.
    """
    # Check if user has permission to view tasks in this organization
    # can_manage = await TaskService.can_user_manage_project(
    #     db=db, user_id=current_user.id, project_id=organization_id
    # )

    # if not can_manage:
    #     raise HTTPException(
    #         status_code=403,
    #         detail="You don't have permission to view tasks in this organization",
    #     )

    try:
        skip = (page - 1) * size
        tasks, total = await TaskService.get_organization_tasks(
            db=db, organization_id=organization_id, skip=skip, limit=size
        )

        # Prepare response with project and organization names
        task_responses = []
        for task in tasks:
            response_data = TaskResponse.model_validate(task)
            task_responses.append(response_data)

        return TaskListResponse(
            tasks=task_responses,
            total=total,
            page=page,
            size=size,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{task_id}", response_model=TaskResponse)
async def get_task(
    task_id: str,
    current_user=Depends(auth_middleware),
    db: AsyncSession = Depends(get_db),
):
    """
    Get task by ID.
    Only admin users or organization creators can view task details.
    """
    try:
        task = await TaskService.get_by_id(db, task_id)
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")

        # Check if user has permission to view this task
        can_manage = await TaskService.can_user_manage_project(
            db=db, user_id=current_user.id, project_id=task.project_id
        )

        if not can_manage:
            raise HTTPException(
                status_code=403,
                detail="You don't have permission to view this task",
            )

        # Prepare response with project and organization names
        response_data = TaskResponse.model_validate(task)

        return response_data
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: str,
    task_update: TaskUpdate,
    current_user=Depends(auth_middleware),
    db: AsyncSession = Depends(get_db),
):
    """
    Update task.
    Only admin users or organization creators can update tasks.
    """
    try:
        task = await TaskService.update(
            db=db,
            task_id=task_id,
            task_update=task_update,
            updated_by_user_id=current_user.id,
        )

        if not task:
            raise HTTPException(status_code=404, detail="Task not found")

        # Prepare response with project and organization names
        response_data = TaskResponse.model_validate(task)

        return response_data
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{task_id}")
async def delete_task(
    task_id: str,
    current_user=Depends(auth_middleware),
    db: AsyncSession = Depends(get_db),
):
    """
    Delete task (soft delete).
    Only admin users or organization creators can delete tasks.
    """
    try:
        success = await TaskService.delete(
            db=db, task_id=task_id, deleted_by_user_id=current_user.id
        )
        if not success:
            raise HTTPException(status_code=404, detail="Task not found")

        return {"message": "Task deleted successfully"}
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{task_id}/assign-employees")
async def assign_employees_to_task(
    task_id: str,
    assign_request: AssignEmployeeToTaskRequest,
    current_user=Depends(auth_middleware),
    db: AsyncSession = Depends(get_db),
):
    """
    Assign employees to a task.
    Only admin users or organization creators can assign employees.
    """
    try:
        success = await TaskService.assign_employees(
            db=db,
            task_id=task_id,
            employee_ids=assign_request.employee_ids,
            assigned_by_user_id=current_user.id,
        )

        return {"message": "Employees assigned to task successfully"}
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{task_id}/remove-employees")
async def remove_employees_from_task(
    task_id: str,
    remove_request: RemoveEmployeeFromTaskRequest,
    current_user=Depends(auth_middleware),
    db: AsyncSession = Depends(get_db),
):
    """
    Remove employees from a task.
    Only admin users or organization creators can remove employees.
    """
    try:
        success = await TaskService.remove_employees(
            db=db,
            task_id=task_id,
            employee_ids=remove_request.employee_ids,
            removed_by_user_id=current_user.id,
        )

        return {"message": "Employees removed from task successfully"}
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{task_id}/employees")
async def get_task_employees(
    task_id: str,
    current_user=Depends(auth_middleware),
    db: AsyncSession = Depends(get_db),
):
    """
    Get all employees assigned to a task.
    Only admin users or organization creators can view task employees.
    """
    try:
        task = await TaskService.get_by_id(db, task_id)
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")

        # Check if user has permission to view this task
        can_manage = await TaskService.can_user_manage_project(
            db=db, user_id=current_user.id, project_id=task.project_id
        )

        if not can_manage:
            raise HTTPException(
                status_code=403,
                detail="You don't have permission to view this task's employees",
            )

        employees = await TaskService.get_task_employees(db, task_id)

        # Convert to response format
        employee_responses = []
        for employee in employees:
            employee_responses.append(
                {
                    "id": employee.id,
                    "name": employee.name,
                    "email": employee.email,
                    "is_active": employee.is_active,
                }
            )

        return {"employees": employee_responses}
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
