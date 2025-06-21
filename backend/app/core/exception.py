from pydantic import BaseModel
from fastapi import HTTPException
from typing import Optional, List
from fastapi.requests import Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import ValidationException


class ValidationErrorItem(BaseModel):
    field: str
    message: str


class ErrorSchema(BaseModel):
    status: int
    message: str
    success: bool = False
    errors: Optional[List[ValidationErrorItem]] = None


async def http_exception_handler(request: Request, exc: HTTPException):
    error_schema = ErrorSchema(
        status=exc.status_code, message=exc.detail, success=False, errors=None
    ).model_dump()
    return JSONResponse(status_code=exc.status_code, content=error_schema)


async def validation_exception_handler(request: Request, exc: ValidationException):
    errors = []
    for error in exc.errors():
        field = ".".join(
            map(str, error["loc"])
        )  # Convert location to a string (e.g., "body.password")
        message = error["msg"]
        errors.append(ValidationErrorItem(field=field, message=message))
    error_schema = ErrorSchema(
        status=422, message="Validation error", success=False, errors=errors
    ).model_dump()
    return JSONResponse(status_code=422, content=error_schema)


async def generic_exception_handler(request: Request, exc: Exception):
    error_schema = ErrorSchema(
        status=500, message=str(exc), success=False, errors=None
    ).model_dump()
    return JSONResponse(status_code=500, content=error_schema)


async def not_found_exception_handler(request: Request, exc: HTTPException):
    error_schema = ErrorSchema(
        status=404, message=str(exc), success=False, errors=None
    ).model_dump()
    return JSONResponse(status_code=404, content=error_schema)
