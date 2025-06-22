from fastapi import APIRouter
from app.api.v1.endpoints import (
    auth,
    organization,
    employee,
    project,
    task,
    time_tracking,
    screenshot,
)

# from app.api.v1.endpoints import users

router = APIRouter()

router.include_router(auth.router, prefix="/auth", tags=["auth"])
router.include_router(
    organization.router, prefix="/organizations", tags=["organizations"]
)
router.include_router(employee.router, prefix="/employees", tags=["employees"])


router.include_router(project.router, prefix="/projects", tags=["projects"])

router.include_router(task.router, prefix="/tasks", tags=["tasks"])
router.include_router(
    time_tracking.router, prefix="/time-tracking", tags=["time-tracking"]
)
router.include_router(screenshot.router, prefix="/screenshots", tags=["screenshots"])
# router.include_router(users.router, prefix="/users", tags=["users"])
