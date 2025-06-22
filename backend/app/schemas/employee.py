from pydantic import BaseModel, Field, EmailStr
from typing import Optional
from datetime import datetime


class EmployeeBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255, description="Employee name")
    email: EmailStr = Field(..., description="Employee email address")


class EmployeeCreate(EmployeeBase):
    password: str = Field(
        ..., min_length=8, description="Employee password (min 8 characters)"
    )
    organization_id: str = Field(..., description="Organization ID")


class EmployeeUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    email: Optional[EmailStr] = None
    password: Optional[str] = Field(None, min_length=8)
    is_active: Optional[bool] = None


class EmployeeResponse(EmployeeBase):
    id: str
    organization_id: str
    organization_name: Optional[str] = None
    is_active: bool
    email_verified: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class EmployeeListResponse(BaseModel):
    employees: list[EmployeeResponse]
    total: int
    page: int
    size: int
