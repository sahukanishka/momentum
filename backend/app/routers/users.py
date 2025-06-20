from fastapi import APIRouter, HTTPException, Depends
from typing import List
from app.schemas.user import UserResponse, UserCreate, UserUpdate
from app.services.user_service import UserService

router = APIRouter()


@router.get("/", response_model=List[UserResponse])
async def get_users():
    """
    Get all users
    """
    return []


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(user_id: int):
    """
    Get a specific user by ID
    """
    raise HTTPException(status_code=404, detail="User not found")


@router.post("/", response_model=UserResponse)
async def create_user(user_data: UserCreate):
    """
    Create a new user
    """
    return {"id": 1, "email": user_data.email, "username": user_data.username}


@router.put("/{user_id}", response_model=UserResponse)
async def update_user(user_id: int, user_data: UserUpdate):
    """
    Update a user
    """
    raise HTTPException(status_code=404, detail="User not found")


@router.delete("/{user_id}")
async def delete_user(user_id: int):
    """
    Delete a user
    """
    return {"message": "User deleted successfully"}
