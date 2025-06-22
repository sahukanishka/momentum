from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class OrganizationBase(BaseModel):
    name: str = Field(
        ..., min_length=1, max_length=255, description="Organization name"
    )
    description: Optional[str] = Field(
        None, max_length=1000, description="Organization description"
    )
    domain: str = Field(
        ..., min_length=1, max_length=255, description="Organization domain"
    )


class OrganizationCreate(OrganizationBase):
    pass


class OrganizationUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)
    domain: Optional[str] = Field(None, min_length=1, max_length=255)
    is_active: Optional[bool] = None


class OrganizationResponse(OrganizationBase):
    id: str
    created_by: str
    created_at: datetime
    updated_at: datetime
    is_active: bool

    class Config:
        from_attributes = True


class OrganizationListResponse(BaseModel):
    organizations: list[OrganizationResponse]
    total: int
    page: int
    size: int
