from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime


class ScreenshotBase(BaseModel):
    path: str = Field(..., description="Path to the screenshot file")
    permission: bool = Field(
        False, description="Whether the app had necessary permissions"
    )
    os: Optional[str] = Field(None, description="Operating system")
    geo_location: Optional[str] = Field(None, description="Geographic location")
    ip_address: Optional[str] = Field(None, description="IP address")
    app: Optional[str] = Field(None, description="Application name")


class ScreenshotCreate(ScreenshotBase):
    employee_id: str = Field(..., description="Employee ID")
    organization_id: str = Field(..., description="Organization ID")
    tracking_id: Optional[str] = Field(None, description="Time tracking session ID")
    project_id: Optional[str] = Field(None, description="Project ID")
    task_id: Optional[str] = Field(None, description="Task ID")


class ScreenshotUpdate(BaseModel):
    path: Optional[str] = Field(None, description="Path to the screenshot file")
    permission: Optional[bool] = Field(
        None, description="Whether the app had necessary permissions"
    )
    os: Optional[str] = Field(None, description="Operating system")
    geo_location: Optional[str] = Field(None, description="Geographic location")
    ip_address: Optional[str] = Field(None, description="IP address")
    app: Optional[str] = Field(None, description="Application name")
    project_id: Optional[str] = Field(None, description="Project ID")
    task_id: Optional[str] = Field(None, description="Task ID")


class ScreenshotResponse(BaseModel):
    id: str
    employee_id: str
    employee_name: Optional[str] = None
    employee_email: Optional[str] = None
    organization_id: str
    organization_name: Optional[str] = None
    tracking_id: Optional[str] = None
    project_id: Optional[str] = None
    project_name: Optional[str] = None
    task_id: Optional[str] = None
    task_name: Optional[str] = None
    path: str
    permission: bool
    os: Optional[str] = None
    geo_location: Optional[str] = None
    ip_address: Optional[str] = None
    app: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ScreenshotListResponse(BaseModel):
    screenshots: List[ScreenshotResponse]
    total: int
    page: int
    size: int


class ScreenshotFilters(BaseModel):
    employee_id: Optional[str] = Field(None, description="Filter by employee ID")
    organization_id: Optional[str] = Field(
        None, description="Filter by organization ID"
    )
    tracking_id: Optional[str] = Field(
        None, description="Filter by time tracking session"
    )
    project_id: Optional[str] = Field(None, description="Filter by project")
    task_id: Optional[str] = Field(None, description="Filter by task")
    permission: Optional[bool] = Field(None, description="Filter by permission status")
    app: Optional[str] = Field(None, description="Filter by application name")
    os: Optional[str] = Field(None, description="Filter by operating system")
    start_date: Optional[datetime] = Field(None, description="Filter from this date")
    end_date: Optional[datetime] = Field(None, description="Filter to this date")
    sort_by: str = Field("created_at", description="Sort field")
    sort_order: str = Field("desc", description="Sort order (asc/desc)")


class ScreenshotUploadRequest(BaseModel):
    """Request model for uploading screenshots from client desktop app"""

    employee_id: str = Field(..., description="Employee ID")
    organization_id: str = Field(..., description="Organization ID")
    tracking_id: Optional[str] = Field(None, description="Time tracking session ID")
    project_id: Optional[str] = Field(None, description="Project ID")
    task_id: Optional[str] = Field(None, description="Task ID")
    path: str = Field(..., description="Path to the screenshot file")
    permission: bool = Field(
        False, description="Whether the app had necessary permissions"
    )
    os: Optional[str] = Field(None, description="Operating system")
    geo_location: Optional[str] = Field(None, description="Geographic location")
    ip_address: Optional[str] = Field(None, description="IP address")
    app: Optional[str] = Field(None, description="Application name")
