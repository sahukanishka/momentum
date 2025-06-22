from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from app.db.database import get_db
from app.middleware.auth_middleware import auth_middleware
from app.models.user import UserRole
from app.schemas.time_tracking import (
    ClockInRequest,
    ClockOutRequest,
    BreakRequest,
    TimeTrackingResponse,
    TimeTrackingListResponse,
    EmployeeTimeListResponse,
    TimeTrackingFilters,
    CurrentSessionResponse,
    TimeReportRequest,
    TimeTrackingUpdate,
)
from app.services.time_tracking_service import TimeTrackingService
from datetime import datetime

router = APIRouter()


@router.post("/clock-in/{employee_id}", response_model=TimeTrackingResponse)
async def clock_in_employee(
    employee_id: str,
    clock_in_data: ClockInRequest,
    current_user=Depends(auth_middleware),
    db: AsyncSession = Depends(get_db),
):
    """
    Clock in an employee.
    Employees can clock themselves in, or admins can clock in any employee.
    """
    # Check if user has permission to clock in this employee
    if current_user.role != UserRole.ADMIN and current_user.id != employee_id:
        raise HTTPException(status_code=403, detail="You can only clock in yourself")

    try:
        time_entry = await TimeTrackingService.clock_in(
            db=db, employee_id=employee_id, clock_in_data=clock_in_data
        )

        # Prepare response
        response_data = TimeTrackingResponse.model_validate(time_entry)

        return response_data
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/clock-out/{employee_id}", response_model=TimeTrackingResponse)
async def clock_out_employee(
    employee_id: str,
    clock_out_data: ClockOutRequest,
    current_user=Depends(auth_middleware),
    db: AsyncSession = Depends(get_db),
):
    """
    Clock out an employee.
    Employees can clock themselves out, or admins can clock out any employee.
    """
    # Check if user has permission to clock out this employee
    if current_user.role != UserRole.ADMIN and current_user.id != employee_id:
        raise HTTPException(status_code=403, detail="You can only clock out yourself")

    try:
        time_entry = await TimeTrackingService.clock_out(
            db=db, employee_id=employee_id, clock_out_data=clock_out_data
        )

        # Prepare response
        response_data = TimeTrackingResponse.model_validate(time_entry)

        return response_data
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/employee/{employee_id}/logs", response_model=TimeTrackingListResponse)
async def get_employee_time_logs(
    employee_id: str,
    start_date: Optional[datetime] = Query(None, description="Filter from this date"),
    end_date: Optional[datetime] = Query(None, description="Filter to this date"),
    project_id: Optional[str] = Query(None, description="Filter by project"),
    task_id: Optional[str] = Query(None, description="Filter by task"),
    is_active: Optional[bool] = Query(None, description="Filter by active status"),
    sort_by: str = Query("created_at", description="Sort field"),
    sort_order: str = Query("desc", description="Sort order (asc/desc)"),
    page: int = Query(1, ge=1, description="Page number"),
    size: int = Query(10, ge=1, le=100, description="Page size"),
    current_user=Depends(auth_middleware),
    db: AsyncSession = Depends(get_db),
):
    """
    Get time logs for an employee with filters and sorting.
    Employees can view their own logs, admins can view any employee's logs.
    """
    # Check if user has permission to view this employee's logs
    if current_user.role != UserRole.ADMIN and current_user.id != employee_id:
        raise HTTPException(
            status_code=403, detail="You can only view your own time logs"
        )

    try:
        filters = TimeTrackingFilters(
            start_date=start_date,
            end_date=end_date,
            employee_id=employee_id,
            project_id=project_id,
            task_id=task_id,
            is_active=is_active,
            sort_by=sort_by,
            sort_order=sort_order,
        )

        skip = (page - 1) * size
        time_logs, total = await TimeTrackingService.get_employee_time_logs(
            db=db, employee_id=employee_id, filters=filters, skip=skip, limit=size
        )

        # Prepare response
        time_log_responses = []
        for log in time_logs:
            response_data = TimeTrackingResponse.model_validate(log)

            time_log_responses.append(response_data)

        return TimeTrackingListResponse(
            time_logs=time_log_responses,
            total=total,
            page=page,
            size=size,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/employees/summary", response_model=EmployeeTimeListResponse)
async def get_all_employees_time_summary(
    start_date: Optional[datetime] = Query(None, description="Filter from this date"),
    end_date: Optional[datetime] = Query(None, description="Filter to this date"),
    project_id: Optional[str] = Query(None, description="Filter by project"),
    task_id: Optional[str] = Query(None, description="Filter by task"),
    is_active: Optional[bool] = Query(None, description="Filter by active status"),
    page: int = Query(1, ge=1, description="Page number"),
    size: int = Query(10, ge=1, le=100, description="Page size"),
    current_user=Depends(auth_middleware),
    db: AsyncSession = Depends(get_db),
):
    """
    Get time summary for all employees.
    Only admin users can view this summary.
    """
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=403, detail="Only admin users can view employee time summaries"
        )

    try:
        filters = TimeTrackingFilters(
            start_date=start_date,
            end_date=end_date,
            project_id=project_id,
            task_id=task_id,
            is_active=is_active,
        )

        skip = (page - 1) * size
        employee_summaries, total = (
            await TimeTrackingService.get_all_employees_time_summary(
                db=db, filters=filters, skip=skip, limit=size
            )
        )

        return EmployeeTimeListResponse(
            employees=employee_summaries,
            total=total,
            page=page,
            size=size,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get(
    "/employee/{employee_id}/current-session", response_model=CurrentSessionResponse
)
async def get_current_session(
    employee_id: str,
    current_user=Depends(auth_middleware),
    db: AsyncSession = Depends(get_db),
):
    """
    Get current active session for an employee.
    Employees can view their own session, admins can view any employee's session.
    """
    # Check if user has permission to view this employee's session
    if current_user.role != UserRole.ADMIN and current_user.id != employee_id:
        raise HTTPException(
            status_code=403, detail="You can only view your own current session"
        )

    try:
        current_session = await TimeTrackingService.get_current_session(
            db=db, employee_id=employee_id
        )

        if not current_session:
            raise HTTPException(status_code=404, detail="No active session found")

        # Calculate current duration
        current_time = datetime.utcnow()
        duration = current_time - current_session.clock_in
        current_duration_minutes = int(duration.total_seconds() / 60)
        current_duration_hours = round(current_duration_minutes / 60, 2)

        # Check if on break
        is_on_break = current_session.break_start and not current_session.break_end

        return CurrentSessionResponse(
            employee_id=current_session.employee_id,
            employee_name=current_session.employee.name,
            employee_email=current_session.employee.email,
            clock_in=current_session.clock_in,
            current_duration_hours=current_duration_hours,
            current_duration_minutes=current_duration_minutes,
            is_on_break=is_on_break,
            break_start=current_session.break_start,
            break_duration_minutes=current_session.break_duration_minutes,
            notes=current_session.notes,
        )
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/employee/{employee_id}/break/start")
async def start_break(
    employee_id: str,
    break_data: BreakRequest,
    current_user=Depends(auth_middleware),
    db: AsyncSession = Depends(get_db),
):
    """
    Start a break for an employee.
    Employees can start their own breaks, admins can start breaks for any employee.
    """
    # Check if user has permission to start break for this employee
    if current_user.role != UserRole.ADMIN and current_user.id != employee_id:
        raise HTTPException(
            status_code=403, detail="You can only start breaks for yourself"
        )

    try:
        time_entry = await TimeTrackingService.start_break(
            db=db, employee_id=employee_id, break_data=break_data
        )

        return {"message": "Break started successfully"}
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/employee/{employee_id}/break/end")
async def end_break(
    employee_id: str,
    break_end: datetime,
    current_user=Depends(auth_middleware),
    db: AsyncSession = Depends(get_db),
):
    """
    End a break for an employee.
    Employees can end their own breaks, admins can end breaks for any employee.
    """
    # Check if user has permission to end break for this employee
    if current_user.role != UserRole.ADMIN and current_user.id != employee_id:
        raise HTTPException(
            status_code=403, detail="You can only end breaks for yourself"
        )

    try:
        time_entry = await TimeTrackingService.end_break(
            db=db, employee_id=employee_id, break_end=break_end
        )

        return {"message": "Break ended successfully"}
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/entry/{entry_id}", response_model=TimeTrackingResponse)
async def update_time_entry(
    entry_id: str,
    update_data: TimeTrackingUpdate,
    current_user=Depends(auth_middleware),
    db: AsyncSession = Depends(get_db),
):
    """
    Update a time tracking entry.
    Only admin users can update time entries.
    """
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=403, detail="Only admin users can update time entries"
        )

    try:
        time_entry = await TimeTrackingService.update_time_entry(
            db=db,
            time_entry_id=entry_id,
            update_data=update_data,
            updated_by_user_id=current_user.id,
        )

        if not time_entry:
            raise HTTPException(status_code=404, detail="Time entry not found")

        # Prepare response
        response_data = TimeTrackingResponse.model_validate(time_entry)

        return response_data
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/entry/{entry_id}")
async def delete_time_entry(
    entry_id: str,
    current_user=Depends(auth_middleware),
    db: AsyncSession = Depends(get_db),
):
    """
    Delete a time tracking entry (soft delete).
    Only admin users can delete time entries.
    """
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=403, detail="Only admin users can delete time entries"
        )

    try:
        success = await TimeTrackingService.delete_time_entry(
            db=db, time_entry_id=entry_id, deleted_by_user_id=current_user.id
        )

        if not success:
            raise HTTPException(status_code=404, detail="Time entry not found")

        return {"message": "Time entry deleted successfully"}
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/report")
async def generate_time_report(
    report_request: TimeReportRequest,
    current_user=Depends(auth_middleware),
    db: AsyncSession = Depends(get_db),
):
    """
    Generate comprehensive time report.
    Only admin users can generate reports.
    """
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=403, detail="Only admin users can generate time reports"
        )

    try:
        report = await TimeTrackingService.generate_time_report(
            db=db, report_request=report_request
        )

        return report
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
