from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from app.db.database import get_db
from app.middleware.auth_middleware import auth_middleware
from app.models.user import UserRole
from app.schemas.screenshot import (
    ScreenshotCreate,
    ScreenshotUpdate,
    ScreenshotResponse,
    ScreenshotListResponse,
    ScreenshotFilters,
    ScreenshotUploadRequest,
)
from app.services.screenshot_service import ScreenshotService
from datetime import datetime
import boto3
import os

router = APIRouter()


@router.post("/upload", response_model=ScreenshotResponse)
async def upload_screenshot(
    upload_data: ScreenshotUploadRequest,
    current_user=Depends(auth_middleware),
    db: AsyncSession = Depends(get_db),
):
    """
    Upload a screenshot from client desktop app.
    Employees can upload their own screenshots, or admins can upload for any employee.
    """
    if (
        current_user.role != UserRole.ADMIN
        and current_user.id != upload_data.employee_id
    ):
        raise HTTPException(
            status_code=403, detail="You can only upload screenshots for yourself"
        )

    try:
        screenshot = await ScreenshotService.upload_screenshot(
            db=db, upload_data=upload_data
        )

        response_data = ScreenshotResponse.model_validate(screenshot)

        return response_data
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{screenshot_id}", response_model=ScreenshotResponse)
async def get_screenshot(
    screenshot_id: str,
    current_user=Depends(auth_middleware),
    db: AsyncSession = Depends(get_db),
):
    """
    Get a specific screenshot by ID.
    Employees can view their own screenshots, admins can view any screenshot.
    """
    try:
        screenshot = await ScreenshotService.get_screenshot(db, screenshot_id)

        if not screenshot:
            raise HTTPException(status_code=404, detail="Screenshot not found")

        # Check permissions
        if (
            current_user.role != UserRole.ADMIN
            and current_user.id != screenshot.employee_id
        ):
            raise HTTPException(
                status_code=403, detail="You can only view your own screenshots"
            )

        response_data = ScreenshotResponse.model_validate(screenshot)

        return response_data
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get(
    "/employee/{employee_id}/screenshots", response_model=ScreenshotListResponse
)
async def get_employee_screenshots(
    employee_id: str,
    tracking_id: Optional[str] = Query(
        None, description="Filter by time tracking session"
    ),
    project_id: Optional[str] = Query(None, description="Filter by project"),
    task_id: Optional[str] = Query(None, description="Filter by task"),
    permission: Optional[bool] = Query(None, description="Filter by permission status"),
    app: Optional[str] = Query(None, description="Filter by application name"),
    os: Optional[str] = Query(None, description="Filter by operating system"),
    start_date: Optional[datetime] = Query(None, description="Filter from this date"),
    end_date: Optional[datetime] = Query(None, description="Filter to this date"),
    sort_by: str = Query("created_at", description="Sort field"),
    sort_order: str = Query("desc", description="Sort order (asc/desc)"),
    page: int = Query(1, ge=1, description="Page number"),
    size: int = Query(10, ge=1, le=100, description="Page size"),
    current_user=Depends(auth_middleware),
    db: AsyncSession = Depends(get_db),
):
    """
    Get screenshots for an employee with filters and sorting.
    Employees can view their own screenshots, admins can view any employee's screenshots.
    """
    if current_user.role != UserRole.ADMIN and current_user.id != employee_id:
        raise HTTPException(
            status_code=403, detail="You can only view your own screenshots"
        )

    try:
        filters = ScreenshotFilters(
            tracking_id=tracking_id,
            project_id=project_id,
            task_id=task_id,
            permission=permission,
            app=app,
            os=os,
            start_date=start_date,
            end_date=end_date,
            sort_by=sort_by,
            sort_order=sort_order,
        )

        skip = (page - 1) * size
        screenshots, total = await ScreenshotService.get_employee_screenshots(
            db=db, employee_id=employee_id, filters=filters, skip=skip, limit=size
        )

        screenshot_responses = []
        for screenshot in screenshots:
            response_data = ScreenshotResponse.model_validate(screenshot)

            screenshot_responses.append(response_data)

        return ScreenshotListResponse(
            screenshots=screenshot_responses,
            total=total,
            page=page,
            size=size,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get(
    "/organization/{organization_id}/screenshots", response_model=ScreenshotListResponse
)
async def get_organization_screenshots(
    organization_id: str,
    employee_id: Optional[str] = Query(None, description="Filter by employee ID"),
    tracking_id: Optional[str] = Query(
        None, description="Filter by time tracking session"
    ),
    project_id: Optional[str] = Query(None, description="Filter by project"),
    task_id: Optional[str] = Query(None, description="Filter by task"),
    permission: Optional[bool] = Query(None, description="Filter by permission status"),
    app: Optional[str] = Query(None, description="Filter by application name"),
    os: Optional[str] = Query(None, description="Filter by operating system"),
    start_date: Optional[datetime] = Query(None, description="Filter from this date"),
    end_date: Optional[datetime] = Query(None, description="Filter to this date"),
    sort_by: str = Query("created_at", description="Sort field"),
    sort_order: str = Query("desc", description="Sort order (asc/desc)"),
    page: int = Query(1, ge=1, description="Page number"),
    size: int = Query(10, ge=1, le=100, description="Page size"),
    current_user=Depends(auth_middleware),
    db: AsyncSession = Depends(get_db),
):
    """
    Get screenshots for an organization with filters and sorting.
    Only admin users can view organization screenshots.
    """
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=403, detail="Only admin users can view organization screenshots"
        )

    try:
        filters = ScreenshotFilters(
            employee_id=employee_id,
            tracking_id=tracking_id,
            project_id=project_id,
            task_id=task_id,
            permission=permission,
            app=app,
            os=os,
            start_date=start_date,
            end_date=end_date,
            sort_by=sort_by,
            sort_order=sort_order,
        )

        skip = (page - 1) * size
        screenshots, total = await ScreenshotService.get_organization_screenshots(
            db=db,
            organization_id=organization_id,
            filters=filters,
            skip=skip,
            limit=size,
        )

        screenshot_responses = []
        for screenshot in screenshots:
            response_data = ScreenshotResponse.model_validate(screenshot)

            screenshot_responses.append(response_data)

        return ScreenshotListResponse(
            screenshots=screenshot_responses,
            total=total,
            page=page,
            size=size,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/project/{project_id}/screenshots", response_model=ScreenshotListResponse)
async def get_project_screenshots(
    project_id: str,
    employee_id: Optional[str] = Query(None, description="Filter by employee ID"),
    organization_id: Optional[str] = Query(
        None, description="Filter by organization ID"
    ),
    tracking_id: Optional[str] = Query(
        None, description="Filter by time tracking session"
    ),
    task_id: Optional[str] = Query(None, description="Filter by task"),
    permission: Optional[bool] = Query(None, description="Filter by permission status"),
    app: Optional[str] = Query(None, description="Filter by application name"),
    os: Optional[str] = Query(None, description="Filter by operating system"),
    start_date: Optional[datetime] = Query(None, description="Filter from this date"),
    end_date: Optional[datetime] = Query(None, description="Filter to this date"),
    sort_by: str = Query("created_at", description="Sort field"),
    sort_order: str = Query("desc", description="Sort order (asc/desc)"),
    page: int = Query(1, ge=1, description="Page number"),
    size: int = Query(10, ge=1, le=100, description="Page size"),
    current_user=Depends(auth_middleware),
    db: AsyncSession = Depends(get_db),
):
    """
    Get screenshots for a project with filters and sorting.
    Only admin users can view project screenshots.
    """
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=403, detail="Only admin users can view project screenshots"
        )

    try:
        filters = ScreenshotFilters(
            employee_id=employee_id,
            organization_id=organization_id,
            tracking_id=tracking_id,
            task_id=task_id,
            permission=permission,
            app=app,
            os=os,
            start_date=start_date,
            end_date=end_date,
            sort_by=sort_by,
            sort_order=sort_order,
        )

        skip = (page - 1) * size
        screenshots, total = await ScreenshotService.get_project_screenshots(
            db=db, project_id=project_id, filters=filters, skip=skip, limit=size
        )

        screenshot_responses = []
        for screenshot in screenshots:
            response_data = ScreenshotResponse.model_validate(screenshot)

            screenshot_responses.append(response_data)

        return ScreenshotListResponse(
            screenshots=screenshot_responses,
            total=total,
            page=page,
            size=size,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/task/{task_id}/screenshots", response_model=ScreenshotListResponse)
async def get_task_screenshots(
    task_id: str,
    employee_id: Optional[str] = Query(None, description="Filter by employee ID"),
    organization_id: Optional[str] = Query(
        None, description="Filter by organization ID"
    ),
    tracking_id: Optional[str] = Query(
        None, description="Filter by time tracking session"
    ),
    project_id: Optional[str] = Query(None, description="Filter by project"),
    permission: Optional[bool] = Query(None, description="Filter by permission status"),
    app: Optional[str] = Query(None, description="Filter by application name"),
    os: Optional[str] = Query(None, description="Filter by operating system"),
    start_date: Optional[datetime] = Query(None, description="Filter from this date"),
    end_date: Optional[datetime] = Query(None, description="Filter to this date"),
    sort_by: str = Query("created_at", description="Sort field"),
    sort_order: str = Query("desc", description="Sort order (asc/desc)"),
    page: int = Query(1, ge=1, description="Page number"),
    size: int = Query(10, ge=1, le=100, description="Page size"),
    current_user=Depends(auth_middleware),
    db: AsyncSession = Depends(get_db),
):
    """
    Get screenshots for a task with filters and sorting.
    Only admin users can view task screenshots.
    """
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=403, detail="Only admin users can view task screenshots"
        )

    try:
        filters = ScreenshotFilters(
            employee_id=employee_id,
            organization_id=organization_id,
            tracking_id=tracking_id,
            project_id=project_id,
            permission=permission,
            app=app,
            os=os,
            start_date=start_date,
            end_date=end_date,
            sort_by=sort_by,
            sort_order=sort_order,
        )

        skip = (page - 1) * size
        screenshots, total = await ScreenshotService.get_task_screenshots(
            db=db, task_id=task_id, filters=filters, skip=skip, limit=size
        )

        screenshot_responses = []
        for screenshot in screenshots:
            response_data = ScreenshotResponse.model_validate(screenshot)

            screenshot_responses.append(response_data)

        return ScreenshotListResponse(
            screenshots=screenshot_responses,
            total=total,
            page=page,
            size=size,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/{screenshot_id}", response_model=ScreenshotResponse)
async def update_screenshot(
    screenshot_id: str,
    update_data: ScreenshotUpdate,
    current_user=Depends(auth_middleware),
    db: AsyncSession = Depends(get_db),
):
    """
    Update a screenshot.
    Employees can update their own screenshots, admins can update any screenshot.
    """
    try:
        # Check permissions
        can_manage = await ScreenshotService.can_user_manage_screenshot(
            db, current_user.id, screenshot_id
        )

        if not can_manage:
            raise HTTPException(
                status_code=403,
                detail="You don't have permission to update this screenshot",
            )

        screenshot = await ScreenshotService.update_screenshot(
            db=db, screenshot_id=screenshot_id, update_data=update_data
        )

        response_data = ScreenshotResponse.model_validate(screenshot)

        return response_data
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{screenshot_id}")
async def delete_screenshot(
    screenshot_id: str,
    current_user=Depends(auth_middleware),
    db: AsyncSession = Depends(get_db),
):
    """
    Delete a screenshot.
    Employees can delete their own screenshots, admins can delete any screenshot.
    """
    try:
        # Check permissions
        can_manage = await ScreenshotService.can_user_manage_screenshot(
            db, current_user.id, screenshot_id
        )

        if not can_manage:
            raise HTTPException(
                status_code=403,
                detail="You don't have permission to delete this screenshot",
            )

        await ScreenshotService.delete_screenshot(db=db, screenshot_id=screenshot_id)

        return {"message": "Screenshot deleted successfully"}
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/s3/presigned-url")
async def get_presigned_url(file_name: str, content_type: str):
    s3_client = boto3.client(
        "s3",
        aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
        aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
        region_name=os.getenv("AWS_REGION"),
    )

    presigned_url = s3_client.generate_presigned_url(
        "put_object",
        Params={
            "Bucket": os.getenv("AWS_S3_BUCKET"),
            "Key": "screenshots/" + file_name,
            "ContentType": content_type,
        },
        ExpiresIn=3600,
    )

    return {
        "success": True,
        "data": {
            "uploadUrl": presigned_url,
            "url": f"{os.getenv('AWS_S3_ENDPOINT')}/{file_name}",
            "path": file_name,
        },
    }
