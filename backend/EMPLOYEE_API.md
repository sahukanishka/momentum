# Employee Management API

This document describes the Employee Management API endpoints that allow administrators and organization creators to manage employees within their organizations.

## Overview

The Employee Management API provides comprehensive CRUD operations for managing employees within organizations. It includes:

- **Employee Creation**: Add new employees with automatic email notification
- **Employee Listing**: View all employees in an organization with pagination
- **Employee Updates**: Modify employee information
- **Employee Status Management**: Activate/deactivate employees
- **Employee Deletion**: Soft delete employees

## Authentication

All endpoints require authentication via JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

## Authorization

- **Admin users** can manage employees in any organization
- **Organization creators** can manage employees in their own organizations
- **Regular users** cannot access employee management features

## API Endpoints

### 1. Create Employee

**POST** `/api/v1/employees/`

Creates a new employee and sends welcome email with login credentials.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "password": "securepassword123",
  "organization_id": "org-uuid-here"
}
```

**Response:**
```json
{
  "id": "emp-uuid-here",
  "name": "John Doe",
  "email": "john.doe@example.com",
  "organization_id": "org-uuid-here",
  "organization_name": "Example Corp",
  "is_active": true,
  "email_verified": false,
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

**Email Notification:**
- Sends welcome email with login credentials
- Includes login URL and temporary password
- Uses existing `login_credentials.html` template

### 2. Get Organization Employees

**GET** `/api/v1/employees/organization/{organization_id}`

Retrieves all employees in an organization with pagination.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `size` (optional): Page size (default: 10, max: 100)

**Response:**
```json
{
  "employees": [
    {
      "id": "emp-uuid-here",
      "name": "John Doe",
      "email": "john.doe@example.com",
      "organization_id": "org-uuid-here",
      "organization_name": "Example Corp",
      "is_active": true,
      "email_verified": false,
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 1,
  "page": 1,
  "size": 10
}
```

### 3. Get Employee by ID

**GET** `/api/v1/employees/{employee_id}`

Retrieves a specific employee by ID.

**Response:**
```json
{
  "id": "emp-uuid-here",
  "name": "John Doe",
  "email": "john.doe@example.com",
  "organization_id": "org-uuid-here",
  "organization_name": "Example Corp",
  "is_active": true,
  "email_verified": false,
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

### 4. Update Employee

**PUT** `/api/v1/employees/{employee_id}`

Updates employee information.

**Request Body:**
```json
{
  "name": "Updated Name",
  "email": "updated@example.com",
  "password": "newpassword123"
}
```

All fields are optional. Only provided fields will be updated.

**Response:**
```json
{
  "id": "emp-uuid-here",
  "name": "Updated Name",
  "email": "updated@example.com",
  "organization_id": "org-uuid-here",
  "organization_name": "Example Corp",
  "is_active": true,
  "email_verified": false,
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

### 5. Deactivate Employee

**PATCH** `/api/v1/employees/{employee_id}/deactivate`

Deactivates an employee (sets `is_active` to `false`).

**Response:**
```json
{
  "message": "Employee deactivated successfully"
}
```

### 6. Activate Employee

**PATCH** `/api/v1/employees/{employee_id}/activate`

Activates an employee (sets `is_active` to `true`).

**Response:**
```json
{
  "message": "Employee activated successfully"
}
```

### 7. Delete Employee

**DELETE** `/api/v1/employees/{employee_id}`

Soft deletes an employee (sets `is_active` to `false`).

**Response:**
```json
{
  "message": "Employee deleted successfully"
}
```

## Error Responses

### 400 Bad Request
```json
{
  "detail": "Employee with this email already exists"
}
```

### 403 Forbidden
```json
{
  "detail": "You don't have permission to add employees to this organization"
}
```

### 404 Not Found
```json
{
  "detail": "Employee not found"
}
```

### 500 Internal Server Error
```json
{
  "detail": "Internal server error"
}
```

## Database Schema

### Employee Model
```python
class Employee(Base):
    __tablename__ = "employees"
    
    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)
    hashed_password: Mapped[str] = mapped_column(String, nullable=False)
    organization_id: Mapped[str] = mapped_column(String, ForeignKey("organizations.id"), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    email_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), onupdate=func.now(), default=func.now())
    
    # Relationships
    organization = relationship("Organization", back_populates="employees")
```

## Features

### Security Features
- Password hashing using bcrypt
- JWT-based authentication
- Role-based access control
- Organization-level permissions

### Email Integration
- Automatic welcome email on employee creation
- Uses existing email templates
- Configurable SMTP settings
- Graceful error handling for email failures

### Data Validation
- Email format validation
- Password strength requirements (min 8 characters)
- Unique email constraints
- Organization existence validation

### Soft Delete
- Employees are soft deleted (is_active = false)
- Data preservation for audit trails
- Ability to reactivate employees

## Usage Examples

### Creating an Employee
```bash
curl -X POST "http://localhost:8000/api/v1/employees/" \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Smith",
    "email": "jane.smith@company.com",
    "password": "securepassword123",
    "organization_id": "org-uuid-here"
  }'
```

### Listing Organization Employees
```bash
curl -X GET "http://localhost:8000/api/v1/employees/organization/org-uuid-here?page=1&size=10" \
  -H "Authorization: Bearer <jwt_token>"
```

### Deactivating an Employee
```bash
curl -X PATCH "http://localhost:8000/api/v1/employees/emp-uuid-here/deactivate" \
  -H "Authorization: Bearer <jwt_token>"
```

## Testing

The API includes comprehensive test coverage in `tests/test_employee.py` covering:
- Employee creation with proper authorization
- Unauthorized access attempts
- Employee listing and pagination
- Employee updates
- Employee activation/deactivation
- Employee deletion

Run tests with:
```bash
pytest tests/test_employee.py -v
``` 