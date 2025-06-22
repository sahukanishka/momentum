from fastapi import APIRouter
from app.api.v1.endpoints import auth, organization, employee

# from app.api.v1.endpoints import users

router = APIRouter()

router.include_router(auth.router, prefix="/auth", tags=["auth"])
router.include_router(
    organization.router, prefix="/organizations", tags=["organizations"]
)
router.include_router(employee.router, prefix="/employees", tags=["employees"])


# router.include_router(users.router, prefix="/users", tags=["users"])
