# app/schemas/project.py
from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime


class ProjectBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255, description="Project name")
    description: Optional[str] = Field(
        None, max_length=2000, description="Project description"
    )
    code: str = Field(..., min_length=1, max_length=50, description="Project code")
    max_hours_per_week: Optional[int] = Field(
        None, ge=1, le=168, description="Max hours per week"
    )
    max_hours_per_day: Optional[int] = Field(
        None, ge=1, le=24, description="Max hours per day"
    )
    start_date: Optional[datetime] = Field(None, description="Project start date")
    end_date: Optional[datetime] = Field(None, description="Project end date")


class ProjectCreate(ProjectBase):
    organization_id: str = Field(..., description="Organization ID")


class ProjectUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=2000)
    code: Optional[str] = Field(None, min_length=1, max_length=50)
    max_hours_per_week: Optional[int] = Field(None, ge=1, le=168)
    max_hours_per_day: Optional[int] = Field(None, ge=1, le=24)
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    is_active: Optional[bool] = None
    is_archived: Optional[bool] = None


class ProjectEmployeeResponse(BaseModel):
    id: str
    name: str
    email: str
    assigned_at: datetime
    is_active: bool

    class Config:
        from_attributes = True


class ProjectResponse(ProjectBase):
    id: str
    organization_id: str
    organization_name: Optional[str] = None
    is_active: bool
    is_archived: bool
    created_at: datetime
    updated_at: datetime
    employees: List[ProjectEmployeeResponse] = []

    model_config = ConfigDict(from_attributes=True)


class ProjectListResponse(BaseModel):
    projects: List[ProjectResponse]
    total: int
    page: int
    size: int


class AssignEmployeeRequest(BaseModel):
    employee_ids: List[str] = Field(..., description="List of employee IDs to assign")


class RemoveEmployeeRequest(BaseModel):
    employee_ids: List[str] = Field(..., description="List of employee IDs to remove")
