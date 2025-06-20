## Project Structure

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
