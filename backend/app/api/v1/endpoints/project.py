# app/api/v1/endpoints/project.py
from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from app.db.database import get_db
from app.middleware.auth_middleware import auth_middleware
from app.models.user import UserRole
from app.schemas.project import (
    ProjectCreate,
    ProjectUpdate,
    ProjectResponse,
    ProjectListResponse,
    AssignEmployeeRequest,
    RemoveEmployeeRequest,
)
from app.services.project_service import ProjectService

router = APIRouter()


@router.post("/", response_model=ProjectResponse)
async def create_project(
    project_data: ProjectCreate,
    current_user=Depends(auth_middleware),
    db: AsyncSession = Depends(get_db),
):
    """
    Create a new project.
    Only admin users or organization creators can create projects.
    """
    if current_user.role != UserRole.ADMIN:
        can_manage = await ProjectService.can_user_manage_organization(
            db=db, user_id=current_user.id, organization_id=project_data.organization_id
        )
        if not can_manage:
            raise HTTPException(
                status_code=403,
                detail="You don't have permission to create projects in this organization",
            )

    try:
        project = await ProjectService.create(
            db=db, project_data=project_data, created_by_user_id=current_user.id
        )

        return project

    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/organization/{organization_id}", response_model=ProjectListResponse)
async def get_organization_projects(
    organization_id: str,
    page: int = Query(1, ge=1, description="Page number"),
    size: int = Query(10, ge=1, le=100, description="Page size"),
    current_user=Depends(auth_middleware),
    db: AsyncSession = Depends(get_db),
):
    """
    Get all projects in an organization.
    Only admin users or organization creators can view projects.
    """
    can_manage = await ProjectService.can_user_manage_organization(
        db=db, user_id=current_user.id, organization_id=organization_id
    )

    if not can_manage:
        raise HTTPException(
            status_code=403,
            detail="You don't have permission to view projects in this organization",
        )

    try:
        skip = (page - 1) * size
        projects, total = await ProjectService.get_organization_projects(
            db=db, organization_id=organization_id, skip=skip, limit=size
        )

        project_responses = []
        for project in projects:
            response_data = ProjectResponse.model_validate(project)
            if project.organization:
                response_data.organization_name = project.organization.name
            project_responses.append(response_data)

        return ProjectListResponse(
            projects=project_responses,
            total=total,
            page=page,
            size=size,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{project_id}", response_model=ProjectResponse)
async def get_project(
    project_id: str,
    current_user=Depends(auth_middleware),
    db: AsyncSession = Depends(get_db),
):
    """
    Get project by ID.
    Only admin users or organization creators can view project details.
    """
    try:
        project = await ProjectService.get_by_id(db, project_id)
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")

        can_manage = await ProjectService.can_user_manage_organization(
            db=db, user_id=current_user.id, organization_id=project.organization_id
        )

        if not can_manage:
            raise HTTPException(
                status_code=403,
                detail="You don't have permission to view this project",
            )

        response_data = ProjectResponse.model_validate(project)
        if project.organization:
            response_data.organization_name = project.organization.name

        return response_data
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/{project_id}", response_model=ProjectResponse)
async def update_project(
    project_id: str,
    project_update: ProjectUpdate,
    current_user=Depends(auth_middleware),
    db: AsyncSession = Depends(get_db),
):
    """
    Update project.
    Only admin users or organization creators can update projects.
    """
    try:
        project = await ProjectService.update(
            db=db,
            project_id=project_id,
            project_update=project_update,
            updated_by_user_id=current_user.id,
        )

        if not project:
            raise HTTPException(status_code=404, detail="Project not found")

        response_data = ProjectResponse.model_validate(project)
        if project.organization:
            response_data.organization_name = project.organization.name

        return response_data
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{project_id}")
async def delete_project(
    project_id: str,
    current_user=Depends(auth_middleware),
    db: AsyncSession = Depends(get_db),
):
    """
    Delete project (soft delete).
    Only admin users or organization creators can delete projects.
    """
    try:
        success = await ProjectService.delete(
            db=db, project_id=project_id, deleted_by_user_id=current_user.id
        )
        if not success:
            raise HTTPException(status_code=404, detail="Project not found")

        return {"message": "Project deleted successfully"}
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/{project_id}/archive")
async def archive_project(
    project_id: str,
    current_user=Depends(auth_middleware),
    db: AsyncSession = Depends(get_db),
):
    """
    Archive project (set is_archived to True).
    Only admin users or organization creators can archive projects.
    """
    try:
        success = await ProjectService.archive(
            db=db, project_id=project_id, archived_by_user_id=current_user.id
        )
        if not success:
            raise HTTPException(status_code=404, detail="Project not found")

        return {"message": "Project archived successfully"}
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/{project_id}/unarchive")
async def unarchive_project(
    project_id: str,
    current_user=Depends(auth_middleware),
    db: AsyncSession = Depends(get_db),
):
    """
    Unarchive project (set is_archived to False).
    Only admin users or organization creators can unarchive projects.
    """
    try:
        success = await ProjectService.unarchive(
            db=db, project_id=project_id, unarchived_by_user_id=current_user.id
        )
        if not success:
            raise HTTPException(status_code=404, detail="Project not found")

        return {"message": "Project unarchived successfully"}
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{project_id}/assign-employees")
async def assign_employees_to_project(
    project_id: str,
    assign_request: AssignEmployeeRequest,
    current_user=Depends(auth_middleware),
    db: AsyncSession = Depends(get_db),
):
    """
    Assign employees to a project.
    Only admin users or organization creators can assign employees.
    """
    try:
        success = await ProjectService.assign_employees(
            db=db,
            project_id=project_id,
            employee_ids=assign_request.employee_ids,
            assigned_by_user_id=current_user.id,
        )

        return {"message": "Employees assigned to project successfully"}
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{project_id}/remove-employees")
async def remove_employees_from_project(
    project_id: str,
    remove_request: RemoveEmployeeRequest,
    current_user=Depends(auth_middleware),
    db: AsyncSession = Depends(get_db),
):
    """
    Remove employees from a project.
    Only admin users or organization creators can remove employees.
    """
    try:
        success = await ProjectService.remove_employees(
            db=db,
            project_id=project_id,
            employee_ids=remove_request.employee_ids,
            removed_by_user_id=current_user.id,
        )

        return {"message": "Employees removed from project successfully"}
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{project_id}/employees")
async def get_project_employees(
    project_id: str,
    current_user=Depends(auth_middleware),
    db: AsyncSession = Depends(get_db),
):
    """
    Get all employees assigned to a project.
    Only admin users or organization creators can view project employees.
    """
    try:
        project = await ProjectService.get_by_id(db, project_id)
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")

        can_manage = await ProjectService.can_user_manage_organization(
            db=db, user_id=current_user.id, organization_id=project.organization_id
        )

        if not can_manage:
            raise HTTPException(
                status_code=403,
                detail="You don't have permission to view this project's employees",
            )

        employees = await ProjectService.get_project_employees(db, project_id)

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
