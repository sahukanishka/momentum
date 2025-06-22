from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_, desc, asc
from sqlalchemy.orm import selectinload
from typing import List, Optional, Tuple
from datetime import datetime, timedelta
from app.models.time_tracking import TimeTracking
from app.models.employee import Employee
from app.models.task import Task
from app.models.project import Project
from app.models.user import User, UserRole
from app.schemas.time_tracking import (
    ClockInRequest,
    ClockOutRequest,
    BreakRequest,
    TimeTrackingUpdate,
    TimeTrackingFilters,
    TimeReportRequest,
)
from fastapi import HTTPException


class TimeTrackingService:
    @staticmethod
    async def clock_in(
        db: AsyncSession, employee_id: str, clock_in_data: ClockInRequest
    ) -> TimeTracking:
        """Clock in an employee"""
        # Check if employee exists and is active
        employee = await db.execute(
            select(Employee).where(
                and_(Employee.id == employee_id, Employee.is_active == True)
            )
        )
        employee = employee.scalar_one_or_none()

        if not employee:
            raise HTTPException(
                status_code=404, detail="Employee not found or inactive"
            )

        # Check if employee already has an active session
        active_session = await db.execute(
            select(TimeTracking).where(
                and_(
                    TimeTracking.employee_id == employee_id,
                    TimeTracking.clock_out == None,
                    TimeTracking.is_active == True,
                )
            )
        )

        if active_session.scalar_one_or_none():
            raise HTTPException(
                status_code=400,
                detail="Employee already has an active session. Please clock out first.",
            )

        # Validate task and project if provided
        if clock_in_data.task_id:
            task = await db.execute(
                select(Task).where(
                    and_(Task.id == clock_in_data.task_id, Task.is_active == True)
                )
            )
            if not task.scalar_one_or_none():
                raise HTTPException(
                    status_code=404, detail="Task not found or inactive"
                )

        if clock_in_data.project_id:
            project = await db.execute(
                select(Project).where(
                    and_(
                        Project.id == clock_in_data.project_id,
                        Project.is_active == True,
                    )
                )
            )
            if not project.scalar_one_or_none():
                raise HTTPException(
                    status_code=404, detail="Project not found or inactive"
                )

        # Create time tracking entry
        time_entry = TimeTracking(
            employee_id=employee_id,
            task_id=clock_in_data.task_id,
            project_id=clock_in_data.project_id,
            clock_in=datetime.utcnow(),
            notes=clock_in_data.notes,
            is_active=True,
        )

        db.add(time_entry)
        await db.commit()
        await db.refresh(time_entry)

        return time_entry

    @staticmethod
    async def clock_out(
        db: AsyncSession, employee_id: str, clock_out_data: ClockOutRequest
    ) -> TimeTracking:
        """Clock out an employee"""
        # Find active session for employee
        active_session = await db.execute(
            select(TimeTracking).where(
                and_(
                    TimeTracking.employee_id == employee_id,
                    TimeTracking.clock_out == None,
                    TimeTracking.is_active == True,
                )
            )
        )
        active_session = active_session.scalar_one_or_none()

        if not active_session:
            raise HTTPException(
                status_code=400, detail="No active session found for this employee"
            )

        # Calculate total time
        clock_out_time = datetime.utcnow()
        # Convert clock_in to UTC naive datetime if it's timezone aware
        clock_in = (
            active_session.clock_in.replace(tzinfo=None)
            if active_session.clock_in.tzinfo
            else active_session.clock_in
        )
        time_diff = clock_out_time - clock_in

        # Subtract break time if any
        break_minutes = active_session.break_duration_minutes or 0
        total_minutes = int(time_diff.total_seconds() / 60) - break_minutes
        total_hours = round(total_minutes / 60, 2)

        # Update time tracking entry
        active_session.clock_out = clock_out_time
        active_session.total_minutes = total_minutes
        active_session.total_hours = total_hours
        if clock_out_data.notes:
            active_session.notes = (
                active_session.notes or ""
            ) + f"\nClock out: {clock_out_data.notes}"

        await db.commit()
        await db.refresh(active_session)

        return active_session

    @staticmethod
    async def start_break(
        db: AsyncSession, employee_id: str, break_data: BreakRequest
    ) -> TimeTracking:
        """Start a break for an employee"""
        # Find active session for employee
        active_session = await db.execute(
            select(TimeTracking).where(
                and_(
                    TimeTracking.employee_id == employee_id,
                    TimeTracking.clock_out == None,
                    TimeTracking.is_active == True,
                )
            )
        )
        active_session = active_session.scalar_one_or_none()

        if not active_session:
            raise HTTPException(
                status_code=400, detail="No active session found for this employee"
            )

        if active_session.break_start and not active_session.break_end:
            raise HTTPException(
                status_code=400, detail="Employee is already on a break"
            )

        # Update break start
        active_session.break_start = break_data.break_start
        if break_data.notes:
            active_session.notes = (
                active_session.notes or ""
            ) + f"\nBreak start: {break_data.notes}"

        await db.commit()
        await db.refresh(active_session)

        return active_session

    @staticmethod
    async def end_break(
        db: AsyncSession, employee_id: str, break_end: datetime
    ) -> TimeTracking:
        """End a break for an employee"""
        # Find active session for employee
        active_session = await db.execute(
            select(TimeTracking).where(
                and_(
                    TimeTracking.employee_id == employee_id,
                    TimeTracking.clock_out == None,
                    TimeTracking.is_active == True,
                )
            )
        )
        active_session = active_session.scalar_one_or_none()

        if not active_session:
            raise HTTPException(
                status_code=400, detail="No active session found for this employee"
            )

        if not active_session.break_start:
            raise HTTPException(
                status_code=400, detail="No active break found for this employee"
            )

        # Calculate break duration
        break_duration = break_end - active_session.break_start
        break_minutes = int(break_duration.total_seconds() / 60)

        # Update break end and duration
        active_session.break_end = break_end
        active_session.break_duration_minutes = break_minutes

        await db.commit()
        await db.refresh(active_session)

        return active_session

    @staticmethod
    async def get_employee_time_logs(
        db: AsyncSession,
        employee_id: str,
        filters: TimeTrackingFilters,
        skip: int = 0,
        limit: int = 100,
    ) -> Tuple[List[TimeTracking], int]:
        """Get time logs for an employee with filters"""
        # Build query
        query = select(TimeTracking).where(TimeTracking.employee_id == employee_id)

        # Apply filters
        if filters.start_date:
            query = query.where(TimeTracking.clock_in >= filters.start_date)
        if filters.end_date:
            query = query.where(TimeTracking.clock_in <= filters.end_date)
        if filters.is_active is not None:
            query = query.where(TimeTracking.is_active == filters.is_active)
        if filters.project_id:
            query = query.where(TimeTracking.project_id == filters.project_id)
        if filters.task_id:
            query = query.where(TimeTracking.task_id == filters.task_id)

        # Get total count
        total_query = select(func.count()).select_from(query.subquery())
        total_result = await db.execute(total_query)
        total = total_result.scalar()

        # Apply sorting
        if filters.sort_by == "clock_in":
            query = query.order_by(
                desc(TimeTracking.clock_in)
                if filters.sort_order == "desc"
                else asc(TimeTracking.clock_in)
            )
        elif filters.sort_by == "total_hours":
            query = query.order_by(
                desc(TimeTracking.total_hours)
                if filters.sort_order == "desc"
                else asc(TimeTracking.total_hours)
            )
        else:
            query = query.order_by(
                desc(TimeTracking.created_at)
                if filters.sort_order == "desc"
                else asc(TimeTracking.created_at)
            )

        # Apply pagination
        query = (
            query.options(
                selectinload(TimeTracking.employee),
                selectinload(TimeTracking.task),
                selectinload(TimeTracking.project),
            )
            .offset(skip)
            .limit(limit)
        )

        result = await db.execute(query)
        time_logs = result.scalars().all()

        return list(time_logs), total

    @staticmethod
    async def get_all_employees_time_summary(
        db: AsyncSession, filters: TimeTrackingFilters, skip: int = 0, limit: int = 100
    ) -> Tuple[List[dict], int]:
        """Get time summary for all employees"""
        # Build base query for employees with time logs
        base_query = select(Employee).join(
            TimeTracking, Employee.id == TimeTracking.employee_id
        )

        # Apply filters
        if filters.start_date:
            base_query = base_query.where(TimeTracking.clock_in >= filters.start_date)
        if filters.end_date:
            base_query = base_query.where(TimeTracking.clock_in <= filters.end_date)
        if filters.is_active is not None:
            base_query = base_query.where(TimeTracking.is_active == filters.is_active)
        if filters.project_id:
            base_query = base_query.where(TimeTracking.project_id == filters.project_id)
        if filters.task_id:
            base_query = base_query.where(TimeTracking.task_id == filters.task_id)

        # Get total count
        total_query = select(func.count(func.distinct(Employee.id))).select_from(
            base_query.subquery()
        )
        total_result = await db.execute(total_query)
        total = total_result.scalar()

        # Get employees with time summary
        employees_query = (
            base_query.options(selectinload(Employee.time_logs))
            .offset(skip)
            .limit(limit)
        )

        result = await db.execute(employees_query)
        employees = result.scalars().all()

        # Calculate summary for each employee
        employee_summaries = []
        for employee in employees:
            time_logs = employee.time_logs

            # Filter time logs based on date range
            if filters.start_date:
                time_logs = [
                    log for log in time_logs if log.clock_in >= filters.start_date
                ]
            if filters.end_date:
                time_logs = [
                    log for log in time_logs if log.clock_in <= filters.end_date
                ]

            total_hours = sum(log.total_hours or 0 for log in time_logs)
            total_minutes = sum(log.total_minutes or 0 for log in time_logs)
            clock_in_count = len([log for log in time_logs if log.clock_in])
            clock_out_count = len([log for log in time_logs if log.clock_out])
            active_sessions = len([log for log in time_logs if log.clock_out is None])

            employee_summaries.append(
                {
                    "employee_id": employee.id,
                    "employee_name": employee.name,
                    "employee_email": employee.email,
                    "total_entries": len(time_logs),
                    "total_hours": round(total_hours, 2),
                    "total_minutes": total_minutes,
                    "date": datetime.utcnow(),
                    "clock_in_count": clock_in_count,
                    "clock_out_count": clock_out_count,
                    "active_sessions": active_sessions,
                }
            )

        return employee_summaries, total

    @staticmethod
    async def get_current_session(
        db: AsyncSession, employee_id: str
    ) -> Optional[TimeTracking]:
        """Get current active session for an employee"""
        result = await db.execute(
            select(TimeTracking)
            .options(
                selectinload(TimeTracking.employee),
                selectinload(TimeTracking.task),
                selectinload(TimeTracking.project),
            )
            .where(
                and_(
                    TimeTracking.employee_id == employee_id,
                    TimeTracking.clock_out == None,
                    TimeTracking.is_active == True,
                )
            )
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def update_time_entry(
        db: AsyncSession,
        time_entry_id: str,
        update_data: TimeTrackingUpdate,
        updated_by_user_id: str,
    ) -> Optional[TimeTracking]:
        """Update a time tracking entry (admin only)"""
        # Get time entry
        time_entry = await db.execute(
            select(TimeTracking)
            .options(
                selectinload(TimeTracking.employee),
                selectinload(TimeTracking.task),
                selectinload(TimeTracking.project),
            )
            .where(TimeTracking.id == time_entry_id)
        )
        time_entry = time_entry.scalar_one_or_none()

        if not time_entry:
            return None

        # Check if user has permission to update this entry
        can_manage = await TimeTrackingService.can_user_manage_employee(
            db=db, user_id=updated_by_user_id, employee_id=time_entry.employee_id
        )

        if not can_manage:
            raise HTTPException(
                status_code=403,
                detail="You don't have permission to update this time entry",
            )

        # Update fields
        update_dict = update_data.model_dump(exclude_unset=True)
        for field, value in update_dict.items():
            setattr(time_entry, field, value)

        # Recalculate total time if clock_in or clock_out changed
        if time_entry.clock_in and time_entry.clock_out:
            time_diff = time_entry.clock_out - time_entry.clock_in
            break_minutes = time_entry.break_duration_minutes or 0
            total_minutes = int(time_diff.total_seconds() / 60) - break_minutes
            time_entry.total_minutes = total_minutes
            time_entry.total_hours = round(total_minutes / 60, 2)

        await db.commit()
        await db.refresh(time_entry)
        return time_entry

    @staticmethod
    async def delete_time_entry(
        db: AsyncSession, time_entry_id: str, deleted_by_user_id: str
    ) -> bool:
        """Delete a time tracking entry (admin only)"""
        time_entry = await db.execute(
            select(TimeTracking).where(TimeTracking.id == time_entry_id)
        )
        time_entry = time_entry.scalar_one_or_none()

        if not time_entry:
            return False

        # Check if user has permission to delete this entry
        can_manage = await TimeTrackingService.can_user_manage_employee(
            db=db, user_id=deleted_by_user_id, employee_id=time_entry.employee_id
        )

        if not can_manage:
            raise HTTPException(
                status_code=403,
                detail="You don't have permission to delete this time entry",
            )

        time_entry.is_active = False
        await db.commit()
        return True

    @staticmethod
    async def generate_time_report(
        db: AsyncSession, report_request: TimeReportRequest
    ) -> dict:
        """Generate comprehensive time report"""
        # Build query
        query = select(TimeTracking).where(
            and_(
                TimeTracking.clock_in >= report_request.start_date,
                TimeTracking.clock_in <= report_request.end_date,
                TimeTracking.is_active == True,
            )
        )

        if report_request.employee_ids:
            query = query.where(
                TimeTracking.employee_id.in_(report_request.employee_ids)
            )
        if report_request.project_id:
            query = query.where(TimeTracking.project_id == report_request.project_id)
        if report_request.task_id:
            query = query.where(TimeTracking.task_id == report_request.task_id)

        query = query.options(
            selectinload(TimeTracking.employee),
            selectinload(TimeTracking.task),
            selectinload(TimeTracking.project),
        )

        result = await db.execute(query)
        time_logs = result.scalars().all()

        # Calculate report data
        total_hours = sum(log.total_hours or 0 for log in time_logs)
        total_minutes = sum(log.total_minutes or 0 for log in time_logs)
        total_entries = len(time_logs)
        unique_employees = len(set(log.employee_id for log in time_logs))

        # Group by employee
        employee_data = {}
        for log in time_logs:
            if log.employee_id not in employee_data:
                employee_data[log.employee_id] = {
                    "employee_name": log.employee.name,
                    "employee_email": log.employee.email,
                    "total_hours": 0,
                    "total_minutes": 0,
                    "entries": 0,
                }

            employee_data[log.employee_id]["total_hours"] += log.total_hours or 0
            employee_data[log.employee_id]["total_minutes"] += log.total_minutes or 0
            employee_data[log.employee_id]["entries"] += 1

        return {
            "report_period": {
                "start_date": report_request.start_date,
                "end_date": report_request.end_date,
            },
            "summary": {
                "total_hours": round(total_hours, 2),
                "total_minutes": total_minutes,
                "total_entries": total_entries,
                "unique_employees": unique_employees,
            },
            "employee_breakdown": employee_data,
            "time_logs": [
                {
                    "id": log.id,
                    "employee_name": log.employee.name,
                    "employee_email": log.employee.email,
                    "task_name": log.task.name if log.task else None,
                    "project_name": log.project.name if log.project else None,
                    "clock_in": log.clock_in,
                    "clock_out": log.clock_out,
                    "total_hours": log.total_hours,
                    "notes": log.notes,
                }
                for log in time_logs
            ],
        }

    @staticmethod
    async def can_user_manage_employee(
        db: AsyncSession, user_id: str, employee_id: str
    ) -> bool:
        """Check if user can manage the employee (admin or organization creator)"""
        # Get user
        user_result = await db.execute(select(User).where(User.id == user_id))
        user = user_result.scalar_one_or_none()

        if not user:
            return False

        # Admin can manage any employee
        if user.role == UserRole.ADMIN:
            return True

        # Get employee with organization info
        employee_result = await db.execute(
            select(Employee)
            .options(selectinload(Employee.organization))
            .where(Employee.id == employee_id)
        )
        employee = employee_result.scalar_one_or_none()

        if not employee:
            return False

        # Organization creator can manage employees in their organization
        if employee.organization.created_by == user_id:
            return True

        return False
