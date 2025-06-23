from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class TaskBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255, description="Task name")
    description: Optional[str] = Field(
        None, max_length=2000, description="Task description"
    )
    code: str = Field(..., min_length=1, max_length=50, description="Task code")
    max_hours_per_week: Optional[int] = Field(
        None, ge=1, le=168, description="Max hours per week"
    )
    max_hours_per_day: Optional[int] = Field(
        None, ge=1, le=24, description="Max hours per day"
    )
    start_date: Optional[datetime] = Field(None, description="Task start date")
    end_date: Optional[datetime] = Field(None, description="Task end date")
    is_default: Optional[bool] = Field(
        False, description="Is this the default task for the project"
    )


class TaskCreate(TaskBase):
    project_id: str = Field(..., description="Project ID")


class TaskUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=2000)
    code: Optional[str] = Field(None, min_length=1, max_length=50)
    max_hours_per_week: Optional[int] = Field(None, ge=1, le=168)
    max_hours_per_day: Optional[int] = Field(None, ge=1, le=24)
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    is_active: Optional[bool] = None
    is_default: Optional[bool] = None


class TaskEmployeeResponse(BaseModel):
    id: str
    name: str
    email: str
    assigned_at: Optional[datetime] = None
    is_active: bool

    class Config:
        from_attributes = True


class TaskResponse(TaskBase):
    id: str
    project_id: str
    project_name: Optional[str] = None
    organization_id: Optional[str] = None
    organization_name: Optional[str] = None
    is_active: bool
    created_at: datetime
    updated_at: datetime
    employees: List[TaskEmployeeResponse] = []

    class Config:
        from_attributes = True


class TaskListResponse(BaseModel):
    tasks: List[TaskResponse]
    total: int
    page: int
    size: int


class AssignEmployeeToTaskRequest(BaseModel):
    employee_ids: List[str] = Field(..., description="List of employee IDs to assign")


class RemoveEmployeeFromTaskRequest(BaseModel):
    employee_ids: List[str] = Field(..., description="List of employee IDs to remove")


class CreateDefaultTaskRequest(BaseModel):
    name: str = Field(
        ..., min_length=1, max_length=255, description="Default task name"
    )
    description: Optional[str] = Field(
        None, max_length=2000, description="Default task description"
    )
