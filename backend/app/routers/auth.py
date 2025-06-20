from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import OAuth2PasswordRequestForm
from app.schemas.auth import UserLogin, UserRegister, TokenResponse
from app.services.auth_service import AuthService

router = APIRouter()


@router.post("/login", response_model=TokenResponse)
async def login(user_credentials: UserLogin):
    """
    Login endpoint for user authentication
    """
    try:
        return {"access_token": "dummy_token", "token_type": "bearer"}
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid credentials")


@router.post("/register", response_model=TokenResponse)
async def register(user_data: UserRegister):
    """
    Register a new user
    """
    try:
        return {"access_token": "dummy_token", "token_type": "bearer"}
    except Exception as e:
        raise HTTPException(status_code=400, detail="Registration failed")


@router.post("/refresh")
async def refresh_token():
    """
    Refresh access token
    """
    return {"access_token": "new_dummy_token", "token_type": "bearer"}
