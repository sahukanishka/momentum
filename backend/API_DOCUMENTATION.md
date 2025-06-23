# 🚀 Momentum API Documentation

## 📋 Complete API Endpoints Reference

| **Endpoint** | **Method** | **Description** | **Request Payload** | **Response** | **Auth Required** |
|--------------|------------|-----------------|---------------------|--------------|-------------------|
| **🔐 AUTHENTICATION** |
| `/api/v1/auth/` | GET | Check auth status | - | `{"detail": "Unauthorized"}` | ❌ |
| `/api/v1/auth/register` | POST | Register new user | `{"email": "string", "password": "string", "name": "string"}` | `{"message": "Otp sent successfully on email"}` | ❌ |
| `/api/v1/auth/signup` | POST | Signup with role | `{"email": "string", "password": "string", "name": "string", "role": "USER"}` | `{"message": "Otp sent successfully on email"}` | ❌ |
| `/api/v1/auth/send-otp` | POST | Send OTP to email | `{"email": "string"}` | `{"message": "OTP sent successfully on email"}` | ❌ |
| `/api/v1/auth/reset-password` | POST | Reset password with OTP | `{"email": "string", "otp": "string", "password": "string"}` | `{"message": "Password updated successfully"}` | ❌ |
| `/api/v1/auth/login` | POST | User login | `{"email": "string", "password": "string"}` | `{"user": {...}, "access_token": "string", "refresh_token": "string"}` | ❌ |
| `/api/v1/auth/verify-email` | POST | Verify email with OTP | `{"email": "string", "otp": "string"}` | `{"user": {...}, "access_token": "string", "refresh_token": "string"}` | ❌ |
| `/api/v1/auth/login-google` | POST | Google OAuth login | `{"token": "string"}` | - | ❌ |
| `/api/v1/auth/logout` | POST | User logout | `{"refresh_token": "string"}` | - | ✅ |
| `/api/v1/auth/me` | GET | Get current user | - | `{"user": {...}}` | ✅ |
| **🏢 ORGANIZATIONS** |
| `/api/v1/organizations/` | POST | Create organization | `{"name": "string", "description": "string", "domain": "string"}` | `OrganizationResponse` | ✅ (Admin) |
| `/api/v1/organizations/` | GET | Get user organizations | Query: `page`, `size` | `OrganizationListResponse` | ✅ |
| `/api/v1/organizations/{id}` | GET | Get organization by ID | - | `OrganizationResponse` | ✅ |
| `/api/v1/organizations/{id}` | PUT | Update organization | `{"name": "string", "description": "string", "domain": "string"}` | `OrganizationResponse` | ✅ |
| `/api/v1/organizations/{id}` | DELETE | Delete organization | - | `{"message": "Organization deleted successfully"}` | ✅ |
| `/api/v1/organizations/domain/{domain}` | GET | Get organization by domain | - | `OrganizationResponse` | ✅ |
| **👥 EMPLOYEES** |
| `/api/v1/employees/` | POST | Create employee | `{"name": "string", "email": "string", "password": "string", "organization_id": "string"}` | `EmployeeResponse` | ✅ |
| `/api/v1/employees/organization/{org_id}` | GET | Get org employees | Query: `page`, `size` | `EmployeeListResponse` | ✅ |
| `/api/v1/employees/{id}` | GET | Get employee by ID | - | `EmployeeResponse` | ✅ |
| `/api/v1/employees/{id}` | PUT | Update employee | `{"name": "string", "email": "string"}` | `EmployeeResponse` | ✅ |
| `/api/v1/employees/{id}` | DELETE | Delete employee | - | `{"message": "Employee deleted successfully"}` | ✅ |
| `/api/v1/employees/{id}/deactivate` | PATCH | Deactivate employee | - | `{"message": "Employee deactivated successfully"}` | ✅ |
| `/api/v1/employees/{id}/activate` | PATCH | Activate employee | - | `{"message": "Employee activated successfully"}` | ✅ |
| **📋 PROJECTS** |
| `/api/v1/projects/` | POST | Create project | `{"name": "string", "description": "string", "code": "string", "organization_id": "string", "max_hours_per_week": int, "max_hours_per_day": int, "start_date": "datetime", "end_date": "datetime"}` | `ProjectResponse` | ✅ |
| `/api/v1/projects/organization/{org_id}` | GET | Get org projects | Query: `page`, `size` | `ProjectListResponse` | ✅ |
| `/api/v1/projects/{id}` | GET | Get project by ID | - | `ProjectResponse` | ✅ |
| `/api/v1/projects/{id}` | PUT | Update project | `{"name": "string", "description": "string", "code": "string", "max_hours_per_week": int, "max_hours_per_day": int, "start_date": "datetime", "end_date": "datetime"}` | `ProjectResponse` | ✅ |
| `/api/v1/projects/{id}` | DELETE | Delete project | - | `{"message": "Project deleted successfully"}` | ✅ |
| `/api/v1/projects/{id}/archive` | PATCH | Archive project | - | `{"message": "Project archived successfully"}` | ✅ |
| `/api/v1/projects/{id}/unarchive` | PATCH | Unarchive project | - | `{"message": "Project unarchived successfully"}` | ✅ |
| `/api/v1/projects/{id}/assign-employees` | POST | Assign employees to project | `{"employee_ids": ["string"]}` | `{"message": "Employees assigned successfully"}` | ✅ |
| `/api/v1/projects/{id}/remove-employees` | POST | Remove employees from project | `{"employee_ids": ["string"]}` | `{"message": "Employees removed successfully"}` | ✅ |
| `/api/v1/projects/{id}/employees` | GET | Get project employees | - | `[EmployeeResponse]` | ✅ |
| **✅ TASKS** |
| `/api/v1/tasks/` | POST | Create task | `{"name": "string", "description": "string", "code": "string", "project_id": "string", "max_hours_per_week": int, "max_hours_per_day": int, "start_date": "datetime", "end_date": "datetime"}` | `TaskResponse` | ✅ |
| `/api/v1/tasks/project/{project_id}/default` | POST | Create default task | `{"name": "string", "description": "string", "code": "string", "max_hours_per_week": int, "max_hours_per_day": int, "start_date": "datetime", "end_date": "datetime"}` | `TaskResponse` | ✅ |
| `/api/v1/tasks/project/{project_id}` | GET | Get project tasks | Query: `page`, `size` | `TaskListResponse` | ✅ |
| `/api/v1/tasks/organization/{org_id}` | GET | Get org tasks | Query: `page`, `size` | `TaskListResponse` | ✅ |
| `/api/v1/tasks/{id}` | GET | Get task by ID | - | `TaskResponse` | ✅ |
| `/api/v1/tasks/{id}` | PUT | Update task | `{"name": "string", "description": "string", "code": "string", "max_hours_per_week": int, "max_hours_per_day": int, "start_date": "datetime", "end_date": "datetime"}` | `TaskResponse` | ✅ |
| `/api/v1/tasks/{id}` | DELETE | Delete task | - | `{"message": "Task deleted successfully"}` | ✅ |
| `/api/v1/tasks/{id}/assign-employees` | POST | Assign employees to task | `{"employee_ids": ["string"]}` | `{"message": "Employees assigned successfully"}` | ✅ |
| `/api/v1/tasks/{id}/remove-employees` | POST | Remove employees from task | `{"employee_ids": ["string"]}` | `{"message": "Employees removed successfully"}` | ✅ |
| `/api/v1/tasks/{id}/employees` | GET | Get task employees | - | `[EmployeeResponse]` | ✅ |
| **⏰ TIME TRACKING** |
| `/api/v1/time-tracking/clock-in/{employee_id}` | POST | Clock in employee | `{"project_id": "string", "task_id": "string", "notes": "string"}` | `TimeTrackingResponse` | ✅ |
| `/api/v1/time-tracking/clock-out/{employee_id}` | POST | Clock out employee | `{"notes": "string"}` | `TimeTrackingResponse` | ✅ |
| `/api/v1/time-tracking/employee/{employee_id}/logs` | GET | Get employee time logs | Query: `start_date`, `end_date`, `project_id`, `task_id`, `is_active`, `sort_by`, `sort_order`, `page`, `size` | `TimeTrackingListResponse` | ✅ |
| `/api/v1/time-tracking/employees/summary` | GET | Get all employees time summary | Query: `start_date`, `end_date`, `project_id`, `task_id`, `is_active`, `page`, `size` | `EmployeeTimeListResponse` | ✅ (Admin) |
| `/api/v1/time-tracking/employee/{employee_id}/current-session` | GET | Get current session | - | `CurrentSessionResponse` | ✅ |
| `/api/v1/time-tracking/employee/{employee_id}/break/start` | POST | Start break | `{"notes": "string"}` | `TimeTrackingResponse` | ✅ |
| `/api/v1/time-tracking/employee/{employee_id}/break/end` | POST | End break | `{"break_end": "datetime"}` | `TimeTrackingResponse` | ✅ |
| `/api/v1/time-tracking/entry/{entry_id}` | PUT | Update time entry | `{"clock_in": "datetime", "clock_out": "datetime", "notes": "string", "break_start": "datetime", "break_end": "datetime"}` | `TimeTrackingResponse` | ✅ |
| `/api/v1/time-tracking/entry/{entry_id}` | DELETE | Delete time entry | - | `{"message": "Time entry deleted successfully"}` | ✅ |
| `/api/v1/time-tracking/report` | POST | Generate time report | `{"employee_ids": ["string"], "start_date": "datetime", "end_date": "datetime", "project_id": "string", "task_id": "string", "report_type": "string"}` | `{"report_url": "string"}` | ✅ |
| **📸 SCREENSHOTS** |
| `/api/v1/screenshots/upload` | POST | Upload screenshot | `{"employee_id": "string", "organization_id": "string", "tracking_id": "string", "project_id": "string", "task_id": "string", "path": "string", "permission": bool, "os": "string", "geo_location": "string", "ip_address": "string", "app": "string"}` | `ScreenshotResponse` | ✅ |
| `/api/v1/screenshots/{id}` | GET | Get screenshot by ID | - | `ScreenshotResponse` | ✅ |
| `/api/v1/screenshots/employee/{employee_id}/screenshots` | GET | Get employee screenshots | Query: `tracking_id`, `project_id`, `task_id`, `permission`, `app`, `os`, `start_date`, `end_date`, `sort_by`, `sort_order`, `page`, `size` | `ScreenshotListResponse` | ✅ |
| `/api/v1/screenshots/organization/{org_id}/screenshots` | GET | Get org screenshots | Query: `employee_id`, `tracking_id`, `project_id`, `task_id`, `permission`, `app`, `os`, `start_date`, `end_date`, `sort_by`, `sort_order`, `page`, `size` | `ScreenshotListResponse` | ✅ (Admin) |
| `/api/v1/screenshots/project/{project_id}/screenshots` | GET | Get project screenshots | Query: `employee_id`, `organization_id`, `tracking_id`, `task_id`, `permission`, `app`, `os`, `start_date`, `end_date`, `sort_by`, `sort_order`, `page`, `size` | `ScreenshotListResponse` | ✅ |
| `/api/v1/screenshots/task/{task_id}/screenshots` | GET | Get task screenshots | Query: `employee_id`, `organization_id`, `tracking_id`, `project_id`, `permission`, `app`, `os`, `start_date`, `end_date`, `sort_by`, `sort_order`, `page`, `size` | `ScreenshotListResponse` | ✅ |
| `/api/v1/screenshots/{id}` | PUT | Update screenshot | `{"permission": bool, "notes": "string"}` | `ScreenshotResponse` | ✅ |
| `/api/v1/screenshots/{id}` | DELETE | Delete screenshot | - | `{"message": "Screenshot deleted successfully"}` | ✅ |
| **🔧 UTILITY** |
| `/` | GET | Root endpoint | - | `{"message": "Welcome to Momentum Fastapi!"}` | ❌ |
| `/health` | GET | Health check | - | `{"status": "healthy"}` | ❌ |
| `/test-cors` | GET | Test CORS | - | `{"message": "CORS is working!", "timestamp": "string"}` | ❌ |
| `/debug` | GET | Debug info | - | `{"message": "Debug endpoint", "cors_origins": [...], "app_name": "string", "debug": bool}` | ❌ |
| `/{full_path:path}` | OPTIONS | Handle preflight requests | - | `{"message": "OK"}` | ❌ |

## 📝 Request/Response Schema Examples

### 🔐 Authentication Payloads

**Login Request:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Login Response:**
```json
{
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "user@example.com",
    "role": "USER",
    "is_active": true,
    "email_verified": true
  },
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

### 🏢 Organization Payloads

**Create Organization Request:**
```json
{
  "name": "Acme Corporation",
  "description": "A leading technology company",
  "domain": "acme.com"
}
```

**Organization Response:**
```json
{
  "id": "uuid",
  "name": "Acme Corporation",
  "description": "A leading technology company",
  "domain": "acme.com",
  "created_by": "user-uuid",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z",
  "is_active": true
}
```

### 👥 Employee Payloads

**Create Employee Request:**
```json
{
  "name": "Jane Smith",
  "email": "jane@acme.com",
  "password": "securepassword123",
  "organization_id": "org-uuid"
}
```

### 📋 Project Payloads

**Create Project Request:**
```json
{
  "name": "Website Redesign",
  "description": "Redesign company website",
  "code": "WEB-001",
  "organization_id": "org-uuid",
  "max_hours_per_week": 40,
  "max_hours_per_day": 8,
  "start_date": "2024-01-01T00:00:00Z",
  "end_date": "2024-03-31T23:59:59Z"
}
```

### ✅ Task Payloads

**Create Task Request:**
```json
{
  "name": "Design Homepage",
  "description": "Create new homepage design",
  "code": "TASK-001",
  "project_id": "project-uuid",
  "max_hours_per_week": 20,
  "max_hours_per_day": 4,
  "start_date": "2024-01-01T00:00:00Z",
  "end_date": "2024-01-15T23:59:59Z"
}
```

### ⏰ Time Tracking Payloads

**Clock In Request:**
```json
{
  "project_id": "project-uuid",
  "task_id": "task-uuid",
  "notes": "Starting work on homepage design"
}
```

**Time Tracking Response:**
```json
{
  "id": "uuid",
  "employee_id": "employee-uuid",
  "project_id": "project-uuid",
  "task_id": "task-uuid",
  "clock_in": "2024-01-01T09:00:00Z",
  "clock_out": null,
  "total_hours": null,
  "total_minutes": null,
  "is_active": true,
  "notes": "Starting work on homepage design",
  "break_start": null,
  "break_end": null,
  "break_duration_minutes": null,
  "created_at": "2024-01-01T09:00:00Z",
  "updated_at": "2024-01-01T09:00:00Z"
}
```

### 📸 Screenshot Payloads

**Upload Screenshot Request:**
```json
{
  "employee_id": "employee-uuid",
  "organization_id": "org-uuid",
  "tracking_id": "tracking-uuid",
  "project_id": "project-uuid",
  "task_id": "task-uuid",
  "path": "/uploads/screenshots/screenshot.jpg",
  "permission": true,
  "os": "Windows 11",
  "geo_location": "New York, NY",
  "ip_address": "192.168.1.100",
  "app": "Visual Studio Code"
}
```

## 🔑 Authentication

All protected endpoints require a valid JWT token in the Authorization header:

```
Authorization: Bearer <access_token>
```

## 📊 Query Parameters

Common query parameters for list endpoints:
- `page`: Page number (default: 1)
- `size`: Page size (default: 10, max: 100)
- `sort_by`: Sort field (default: "created_at")
- `sort_order`: Sort order - "asc" or "desc" (default: "desc")

## 🚨 Error Responses

Standard error response format:
```json
{
  "detail": "Error message description"
}
```

Common HTTP status codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `500`: Internal Server Error 