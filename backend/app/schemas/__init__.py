# Pydantic schemas
from app.schemas.user import UserResponse, UserUpdate
from app.schemas.auth import TokenResponse
from app.schemas.organization import (
    OrganizationCreate,
    OrganizationUpdate,
    OrganizationResponse,
    OrganizationListResponse,
)
from app.schemas.employee import (
    EmployeeCreate,
    EmployeeUpdate,
    EmployeeResponse,
    EmployeeListResponse,
)

from app.schemas.project import (
    ProjectCreate,
    ProjectUpdate,
    ProjectResponse,
    ProjectListResponse,
    AssignEmployeeRequest,
    RemoveEmployeeRequest,
)

from app.schemas.task import (
    TaskCreate,
    TaskUpdate,
    TaskResponse,
    TaskListResponse,
    AssignEmployeeToTaskRequest,
    RemoveEmployeeFromTaskRequest,
    CreateDefaultTaskRequest,
)

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

from app.schemas.screenshot import (
    ScreenshotCreate,
    ScreenshotUpdate,
    ScreenshotResponse,
    ScreenshotListResponse,
    ScreenshotFilters,
    ScreenshotUploadRequest,
)
