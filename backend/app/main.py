from fastapi import FastAPI, HTTPException, Depends
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer
from app.api.v1.routers import router as v1_router
from app.core.config import settings
from app.core.exception import (
    http_exception_handler,
    validation_exception_handler,
    generic_exception_handler,
    not_found_exception_handler,
)
from app.middleware.response_middleware import response_middleware
from app.api.v1.routers import router as api_router
from app.db.database import init_db, close_db
from contextlib import asynccontextmanager

# Security scheme for JWT authentication
security = HTTPBearer(
    scheme_name="JWT", description="Enter your JWT token in the format: Bearer <token>"
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Initializing database...")
    await init_db()
    yield
    print("Closing database...")
    await close_db()


app = FastAPI(
    title=settings.app_name,
    description="Momentum API",
    version=settings.app_version,
    docs_url="/docs",
    redoc_url="/redoc",
    debug=settings.debug,
    lifespan=lifespan,
    servers=[
        {"url": "http://localhost:8000", "description": "Development server"},
        {"url": "https://api.momentum.com", "description": "Production server"},
    ],
)

# Define CORS origins explicitly
origins = [
    "http://localhost:8080",
    "http://127.0.0.1:8080",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",  # Vite default port
    "http://127.0.0.1:5173",
]

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
)

# Include API router
app.include_router(api_router, prefix="/api/v1")


@app.get(
    "/",
    tags=["Utility"],
    summary="Root endpoint",
    response_description="Welcome message",
)
async def root():
    return {"message": f"Welcome to {settings.app_name}!"}


@app.get(
    "/health",
    tags=["Utility"],
    summary="Health check",
    response_description="API health status",
)
async def health_check():
    return {"status": "healthy"}


@app.get(
    "/test-cors",
    tags=["Utility"],
    summary="Test CORS",
    response_description="CORS test response",
)
async def test_cors():

    return {"message": "CORS is working!", "timestamp": "2024-01-01T00:00:00Z"}


@app.get(
    "/debug",
    tags=["Utility"],
    summary="Debug information",
    response_description="Debug configuration",
)
async def debug_info():

    return {
        "message": "Debug endpoint",
        "cors_origins": origins,
        "app_name": settings.app_name,
        "debug": settings.debug,
    }


@app.options("/{full_path:path}", tags=["Utility"], summary="Handle preflight requests")
async def options_handler(full_path: str):

    return {"message": "OK"}


app.include_router(v1_router, prefix="/api/v1")


app.add_exception_handler(HTTPException, http_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(Exception, generic_exception_handler)
app.add_exception_handler(404, not_found_exception_handler)

app.middleware("http")(response_middleware)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host=settings.host, port=settings.port)
