from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from app.db.database import get_db
from app.middleware.auth_middleware import auth_middleware
from app.models.user import UserRole
from app.schemas.organization import (
    OrganizationCreate,
    OrganizationUpdate,
    OrganizationResponse,
    OrganizationListResponse,
)
from app.services.organization_service import OrganizationService
from app.services.user_service import UserService

router = APIRouter()


@router.post("/", response_model=OrganizationResponse)
async def create_organization(
    organization_data: OrganizationCreate,
    current_user=Depends(auth_middleware),
    db: AsyncSession = Depends(get_db),
):
    """
    Create a new organization.
    Only admin users can create organizations.
    """
    print("current_user", current_user)
    # Check if user is admin
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=403, detail="Only admin users can create organizations"
        )

    try:
        organization = await OrganizationService.create(
            db=db, organization_data=organization_data, created_by=current_user.id
        )
        return OrganizationResponse.model_validate(organization)
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/", response_model=OrganizationListResponse)
async def get_user_organizations(
    page: int = Query(1, ge=1, description="Page number"),
    size: int = Query(10, ge=1, le=100, description="Page size"),
    current_user=Depends(auth_middleware),
    db: AsyncSession = Depends(get_db),
):
    """
    Get all organizations created by the current user.
    """
    print("current_user", current_user)
    try:
        skip = (page - 1) * size
        organizations, total = await OrganizationService.get_user_organizations(
            db=db, user_id=current_user.id, skip=skip, limit=size
        )

        return OrganizationListResponse(
            organizations=[
                OrganizationResponse.model_validate(org) for org in organizations
            ],
            total=total,
            page=page,
            size=size,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{organization_id}", response_model=OrganizationResponse)
async def get_organization(
    organization_id: str,
    current_user=Depends(auth_middleware),
    db: AsyncSession = Depends(get_db),
):
    """
    Get organization by ID.
    Users can only access organizations they created or if they are admin.
    """
    try:
        # Check if user can access this organization
        can_access = await OrganizationService.can_user_manage_organization(
            db=db, user_id=current_user.id, organization_id=organization_id
        )

        if not can_access:
            raise HTTPException(
                status_code=403,
                detail="You don't have permission to access this organization",
            )

        organization = await OrganizationService.get_by_id(db, organization_id)
        if not organization:
            raise HTTPException(status_code=404, detail="Organization not found")

        return OrganizationResponse.model_validate(organization)
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/{organization_id}", response_model=OrganizationResponse)
async def update_organization(
    organization_id: str,
    organization_update: OrganizationUpdate,
    current_user=Depends(auth_middleware),
    db: AsyncSession = Depends(get_db),
):
    """
    Update organization.
    Only the creator or admin users can update organizations.
    """
    try:
        # Check if user can manage this organization
        can_manage = await OrganizationService.can_user_manage_organization(
            db=db, user_id=current_user.id, organization_id=organization_id
        )

        if not can_manage:
            raise HTTPException(
                status_code=403,
                detail="You don't have permission to update this organization",
            )

        organization = await OrganizationService.update(
            db=db,
            organization_id=organization_id,
            organization_update=organization_update,
        )

        if not organization:
            raise HTTPException(status_code=404, detail="Organization not found")

        return OrganizationResponse.model_validate(organization)
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{organization_id}")
async def delete_organization(
    organization_id: str,
    current_user=Depends(auth_middleware),
    db: AsyncSession = Depends(get_db),
):
    """
    Delete organization (soft delete).
    Only the creator or admin users can delete organizations.
    """
    try:
        # Check if user can manage this organization
        can_manage = await OrganizationService.can_user_manage_organization(
            db=db, user_id=current_user.id, organization_id=organization_id
        )

        if not can_manage:
            raise HTTPException(
                status_code=403,
                detail="You don't have permission to delete this organization",
            )

        success = await OrganizationService.delete(db, organization_id)
        if not success:
            raise HTTPException(status_code=404, detail="Organization not found")

        return {"message": "Organization deleted successfully"}
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/domain/{domain}", response_model=OrganizationResponse)
async def get_organization_by_domain(
    domain: str,
    current_user=Depends(auth_middleware),
    db: AsyncSession = Depends(get_db),
):
    """
    Get organization by domain.
    Users can only access organizations they created or if they are admin.
    """
    try:
        organization = await OrganizationService.get_by_domain(db, domain)
        if not organization:
            raise HTTPException(status_code=404, detail="Organization not found")

        # Check if user can access this organization
        can_access = await OrganizationService.can_user_manage_organization(
            db=db, user_id=current_user.id, organization_id=organization.id
        )

        if not can_access:
            raise HTTPException(
                status_code=403,
                detail="You don't have permission to access this organization",
            )

        return OrganizationResponse.model_validate(organization)
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
