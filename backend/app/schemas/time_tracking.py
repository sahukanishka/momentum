from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class TimeTrackingBase(BaseModel):
    task_id: Optional[str] = Field(None, description="Task ID (optional)")
    project_id: Optional[str] = Field(None, description="Project ID (optional)")
    notes: Optional[str] = Field(
        None, max_length=1000, description="Notes for this time entry"
    )


class ClockInRequest(TimeTrackingBase):
    pass


class ClockOutRequest(BaseModel):
    notes: Optional[str] = Field(
        None, max_length=1000, description="Notes for clock out"
    )


class BreakRequest(BaseModel):
    break_start: datetime = Field(..., description="Break start time")
    break_end: Optional[datetime] = Field(None, description="Break end time")
    notes: Optional[str] = Field(None, max_length=1000, description="Break notes")


class TimeTrackingUpdate(BaseModel):
    clock_in: Optional[datetime] = None
    clock_out: Optional[datetime] = None
    notes: Optional[str] = Field(None, max_length=1000)
    task_id: Optional[str] = None
    project_id: Optional[str] = None


class TimeTrackingResponse(BaseModel):
    id: str
    employee_id: str
    employee_name: Optional[str] = None
    employee_email: Optional[str] = None
    task_id: Optional[str] = None
    task_name: Optional[str] = None
    project_id: Optional[str] = None
    project_name: Optional[str] = None
    clock_in: datetime
    clock_out: Optional[datetime] = None
    total_hours: Optional[float] = None
    total_minutes: Optional[int] = None
    break_start: Optional[datetime] = None
    break_end: Optional[datetime] = None
    break_duration_minutes: Optional[int] = None
    notes: Optional[str] = None
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class EmployeeTimeSummary(BaseModel):
    employee_id: str
    employee_name: str
    employee_email: str
    total_entries: int
    total_hours: float
    total_minutes: int
    date: datetime
    clock_in_count: int
    clock_out_count: int
    active_sessions: int


class TimeTrackingListResponse(BaseModel):
    time_logs: List[TimeTrackingResponse]
    total: int
    page: int
    size: int


class EmployeeTimeListResponse(BaseModel):
    employees: List[EmployeeTimeSummary]
    total: int
    page: int
    size: int


class TimeTrackingFilters(BaseModel):
    start_date: Optional[datetime] = Field(None, description="Filter from this date")
    end_date: Optional[datetime] = Field(None, description="Filter to this date")
    employee_id: Optional[str] = Field(None, description="Filter by employee")
    project_id: Optional[str] = Field(None, description="Filter by project")
    task_id: Optional[str] = Field(None, description="Filter by task")
    is_active: Optional[bool] = Field(None, description="Filter by active status")
    sort_by: Optional[str] = Field("created_at", description="Sort field")
    sort_order: Optional[str] = Field("desc", description="Sort order (asc/desc)")


class CurrentSessionResponse(BaseModel):
    employee_id: str
    employee_name: str
    employee_email: str
    clock_in: datetime
    current_duration_hours: float
    current_duration_minutes: int
    is_on_break: bool
    break_start: Optional[datetime] = None
    break_duration_minutes: Optional[int] = None
    notes: Optional[str] = None


class TimeReportRequest(BaseModel):
    start_date: datetime = Field(..., description="Report start date")
    end_date: datetime = Field(..., description="Report end date")
    employee_ids: Optional[List[str]] = Field(
        None, description="Specific employees to include"
    )
    project_id: Optional[str] = Field(None, description="Filter by project")
    task_id: Optional[str] = Field(None, description="Filter by task")
    include_breaks: bool = Field(True, description="Include break time in calculations")
