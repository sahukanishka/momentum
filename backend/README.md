# Momentum Backend

A FastAPI-based backend service for the Momentum consulting case interview preparation platform.

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Docker & Docker Compose
- PostgreSQL

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Run with Docker (Recommended)**
   ```bash
   docker-compose up -d
   ```

4. **Run locally**
   ```bash
   pip install -r requirements.txt
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

## 📚 API Documentation

### Interactive API Docs
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc


## 🏗️ Project Structure

```
/backend
├── app/
│   ├── main.py              # FastAPI application entry point
│   ├── models/              # SQLAlchemy database models
│   ├── schemas/             # Pydantic schemas for request/response
│   ├── routers/             # API route handlers
│   ├── services/            # Business logic layer
│   ├── db/                  # Database configuration
│   └── auth/                # Authentication utilities
├── tests/                   # Test files
├── alembic/                 # Database migration files
├── Dockerfile               # Docker configuration
├── docker-compose.yml       # Docker Compose setup
└── requirements.txt         # Python dependencies
```

## 🏛️ Architecture

### Technology Stack
- **Framework**: FastAPI (Python)
- **Database**: PostgreSQL
- **ORM**: SQLAlchemy
- **Authentication**: JWT tokens
- **Email**: SMTP with HTML templates
- **Containerization**: Docker & Docker Compose

### Architecture Patterns

#### 1. **Layered Architecture**
- **API Layer**: FastAPI routes and request/response handling
- **Service Layer**: Business logic and data processing
- **Data Layer**: Database models and repositories

#### 2. **Dependency Injection**
- FastAPI's dependency injection for database sessions
- Service layer injection for business logic
- Middleware for cross-cutting concerns

#### 3. **Repository Pattern**
- Service classes encapsulate data access logic
- Models handle database relationships
- Schemas validate input/output data

### Key Components

#### Authentication System
- JWT-based authentication with refresh tokens
- Role-based access control (Admin, Organization Creator)
- Middleware for route protection

#### Database Design
- **Users**: System users with roles
- **Organizations**: Multi-tenant organizations
- **Projects**: Projects within organizations
- **Tasks**: Tasks within projects
- **Employees**: Organization members
- **Time Tracking**: Work time records
- **Screen Shoots** : Captures ss

#### Email System
- HTML email templates for notifications
- Welcome emails, OTP verification, login credentials
- SMTP configuration for email delivery

