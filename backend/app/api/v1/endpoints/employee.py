from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from app.db.database import get_db
from app.middleware.auth_middleware import auth_middleware
from app.models.user import UserRole
from app.schemas.employee import (
    EmployeeCreate,
    EmployeeUpdate,
    EmployeeResponse,
    EmployeeListResponse,
)
from app.services.employee_service import EmployeeService

router = APIRouter()


@router.post("/", response_model=EmployeeResponse)
async def create_employee(
    employee_data: EmployeeCreate,
    current_user=Depends(auth_middleware),
    db: AsyncSession = Depends(get_db),
):
    """
    Create a new employee.
    Only admin users or organization creators can add employees.
    """
    if current_user.role != UserRole.ADMIN:
        can_manage = await EmployeeService.can_user_manage_organization(
            db=db,
            user_id=current_user.id,
            organization_id=employee_data.organization_id,
        )
        if not can_manage:
            raise HTTPException(
                status_code=403,
                detail="You don't have permission to add employees to this organization",
            )

    try:
        employee = await EmployeeService.create(
            db=db, employee_data=employee_data, created_by_user_id=current_user.id
        )
        print("employee", employee)

        # response_data = EmployeeResponse.model_validate(employee)
        # if employee.organization:
        #     response_data.organization_name = employee.organization.name

        return employee
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/organization/{organization_id}", response_model=EmployeeListResponse)
async def get_organization_employees(
    organization_id: str,
    page: int = Query(1, ge=1, description="Page number"),
    size: int = Query(10, ge=1, le=100, description="Page size"),
    current_user=Depends(auth_middleware),
    db: AsyncSession = Depends(get_db),
):
    """
    Get all employees in an organization.
    Only admin users or organization creators can view employees.
    """
    # Check if user has permission to view employees in this organization
    can_manage = await EmployeeService.can_user_manage_organization(
        db=db, user_id=current_user.id, organization_id=organization_id
    )

    if not can_manage:
        raise HTTPException(
            status_code=403,
            detail="You don't have permission to view employees in this organization",
        )

    try:
        skip = (page - 1) * size
        employees, total = await EmployeeService.get_organization_employees(
            db=db, organization_id=organization_id, skip=skip, limit=size
        )

        # Prepare response with organization names
        employee_responses = []
        for employee in employees:
            response_data = EmployeeResponse.model_validate(employee)
            if employee.organization:
                response_data.organization_name = employee.organization.name
            employee_responses.append(response_data)

        return EmployeeListResponse(
            employees=employee_responses,
            total=total,
            page=page,
            size=size,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{employee_id}", response_model=EmployeeResponse)
async def get_employee(
    employee_id: str,
    current_user=Depends(auth_middleware),
    db: AsyncSession = Depends(get_db),
):
    """
    Get employee by ID.
    Only admin users or organization creators can view employee details.
    """
    try:
        employee = await EmployeeService.get_by_id(db, employee_id)
        if not employee:
            raise HTTPException(status_code=404, detail="Employee not found")

        # Check if user has permission to view this employee
        can_manage = await EmployeeService.can_user_manage_organization(
            db=db, user_id=current_user.id, organization_id=employee.organization_id
        )

        if not can_manage:
            raise HTTPException(
                status_code=403,
                detail="You don't have permission to view this employee",
            )

        response_data = EmployeeResponse.model_validate(employee)
        if employee.organization:
            response_data.organization_name = employee.organization.name

        return response_data
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/{employee_id}", response_model=EmployeeResponse)
async def update_employee(
    employee_id: str,
    employee_update: EmployeeUpdate,
    current_user=Depends(auth_middleware),
    db: AsyncSession = Depends(get_db),
):
    """
    Update employee.
    Only admin users or organization creators can update employees.
    """
    try:
        employee = await EmployeeService.update(
            db=db,
            employee_id=employee_id,
            employee_update=employee_update,
            updated_by_user_id=current_user.id,
        )

        if not employee:
            raise HTTPException(status_code=404, detail="Employee not found")

        response_data = EmployeeResponse.model_validate(employee)
        if employee.organization:
            response_data.organization_name = employee.organization.name

        return response_data
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{employee_id}")
async def delete_employee(
    employee_id: str,
    current_user=Depends(auth_middleware),
    db: AsyncSession = Depends(get_db),
):
    """
    Delete employee (soft delete).
    Only admin users or organization creators can delete employees.
    """
    try:
        success = await EmployeeService.delete(
            db=db, employee_id=employee_id, deleted_by_user_id=current_user.id
        )
        if not success:
            raise HTTPException(status_code=404, detail="Employee not found")

        return {"message": "Employee deleted successfully"}
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/{employee_id}/deactivate")
async def deactivate_employee(
    employee_id: str,
    current_user=Depends(auth_middleware),
    db: AsyncSession = Depends(get_db),
):
    """
    Deactivate employee (set is_active to False).
    Only admin users or organization creators can deactivate employees.
    """
    try:
        success = await EmployeeService.deactivate(
            db=db, employee_id=employee_id, deactivated_by_user_id=current_user.id
        )
        if not success:
            raise HTTPException(status_code=404, detail="Employee not found")

        return {"message": "Employee deactivated successfully"}
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/{employee_id}/activate")
async def activate_employee(
    employee_id: str,
    current_user=Depends(auth_middleware),
    db: AsyncSession = Depends(get_db),
):
    """
    Activate employee (set is_active to True).
    Only admin users or organization creators can activate employees.
    """
    try:
        success = await EmployeeService.activate(
            db=db, employee_id=employee_id, activated_by_user_id=current_user.id
        )
        if not success:
            raise HTTPException(status_code=404, detail="Employee not found")

        return {"message": "Employee activated successfully"}
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
