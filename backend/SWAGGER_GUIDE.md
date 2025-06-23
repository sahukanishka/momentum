# 📚 Swagger API Documentation Guide

## 🚀 Overview

The Momentum API includes comprehensive Swagger/OpenAPI documentation that provides an interactive interface for exploring and testing all API endpoints.

## 🔗 Access URLs

Once your FastAPI server is running, you can access the documentation at:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc  
- **OpenAPI JSON**: http://localhost:8000/openapi.json

## 🎯 Features

### 📋 **Interactive Documentation**
- **Try it out**: Test endpoints directly from the browser
- **Request/Response examples**: See actual data formats
- **Authentication**: Easy token management
- **Schema validation**: Automatic request validation

### 🏷️ **Organized by Tags**
- **Authentication**: User registration, login, OTP verification
- **Organizations**: Multi-tenant organization management
- **Employees**: Employee management within organizations
- **Projects**: Project creation and management
- **Tasks**: Task management within projects
- **Time Tracking**: Clock in/out, break management
- **Screenshots**: Screenshot monitoring and metadata
- **Utility**: Health checks and debugging

### 🔐 **Authentication Support**
- **Bearer Token**: JWT-based authentication
- **Auto-authorization**: Set token once, use across all endpoints
- **Token validation**: Automatic token verification

## 🛠️ How to Use

### 1. **Start the Server**
```bash
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 2. **Access Swagger UI**
Open your browser and go to: http://localhost:8000/docs

### 3. **Authenticate**
1. Click the **"Authorize"** button (🔒) at the top
2. Enter your JWT token: `Bearer your_access_token_here`
3. Click **"Authorize"**

### 4. **Test Endpoints**
1. Find the endpoint you want to test
2. Click **"Try it out"**
3. Fill in the required parameters
4. Click **"Execute"**
5. View the response

## 📖 **API Documentation Structure**

### **Authentication Endpoints**
```
POST /api/v1/auth/register     - Register new user
POST /api/v1/auth/login        - User login
POST /api/v1/auth/verify-email - Verify email with OTP
GET  /api/v1/auth/me           - Get current user
```

### **Organization Management**
```
POST   /api/v1/organizations/           - Create organization
GET    /api/v1/organizations/           - List user organizations
GET    /api/v1/organizations/{id}       - Get organization details
PUT    /api/v1/organizations/{id}       - Update organization
DELETE /api/v1/organizations/{id}       - Delete organization
```

### **Employee Management**
```
POST   /api/v1/employees/                    - Create employee
GET    /api/v1/employees/organization/{id}   - List organization employees
GET    /api/v1/employees/{id}                - Get employee details
PUT    /api/v1/employees/{id}                - Update employee
DELETE /api/v1/employees/{id}                - Delete employee
```

### **Project Management**
```
POST   /api/v1/projects/                     - Create project
GET    /api/v1/projects/organization/{id}    - List organization projects
GET    /api/v1/projects/{id}                 - Get project details
PUT    /api/v1/projects/{id}                 - Update project
DELETE /api/v1/projects/{id}                 - Delete project
PATCH  /api/v1/projects/{id}/archive         - Archive project
PATCH  /api/v1/projects/{id}/unarchive       - Unarchive project
```

### **Time Tracking**
```
POST /api/v1/time-tracking/clock-in/{id}     - Clock in employee
POST /api/v1/time-tracking/clock-out/{id}    - Clock out employee
GET  /api/v1/time-tracking/employee/{id}/logs - Get employee time logs
```

## 🔧 **Testing Workflow**

### **Complete User Journey Example**

1. **Register a new user**:
   ```
   POST /api/v1/auth/register
   {
     "email": "user@example.com",
     "password": "securepass123",
     "name": "John Doe"
   }
   ```

2. **Verify email** (check email for OTP):
   ```
   POST /api/v1/auth/verify-email
   {
     "email": "user@example.com",
     "otp": "123456"
   }
   ```

3. **Login to get token**:
   ```
   POST /api/v1/auth/login
   {
     "email": "user@example.com",
     "password": "securepass123"
   }
   ```

4. **Create organization** (Admin only):
   ```
   POST /api/v1/organizations/
   {
     "name": "Acme Corp",
     "description": "Technology company",
     "domain": "acme.com"
   }
   ```

5. **Add employees**:
   ```
   POST /api/v1/employees/
   {
     "name": "Jane Smith",
     "email": "jane@acme.com",
     "password": "securepass123",
     "organization_id": "org-uuid"
   }
   ```

6. **Create project**:
   ```
   POST /api/v1/projects/
   {
     "name": "Website Redesign",
     "description": "Redesign company website",
     "code": "WEB-001",
     "organization_id": "org-uuid",
     "max_hours_per_week": 40
   }
   ```

## 🎨 **Swagger UI Features**

### **Request Builder**
- **Parameters**: Auto-populated with examples
- **Request Body**: JSON editor with validation
- **Headers**: Automatic content-type and authorization

### **Response Viewer**
- **Status Codes**: Color-coded responses
- **Response Body**: Formatted JSON display
- **Headers**: Response headers information
- **Schema**: Data structure documentation

### **Authentication**
- **Bearer Token**: Secure token storage
- **Auto-include**: Automatic header inclusion
- **Token Validation**: Real-time validation

## 🚨 **Common Issues & Solutions**

### **CORS Errors**
- Ensure your frontend origin is in the CORS configuration
- Test with `/test-cors` endpoint
- Check browser console for specific errors

### **Authentication Errors**
- Verify token format: `Bearer <token>`
- Check token expiration
- Ensure user account is active and email verified

### **Validation Errors**
- Check required fields in request body
- Verify data types (string, integer, boolean)
- Review field constraints (min/max length, etc.)

## 📱 **Mobile Testing**

The Swagger UI is responsive and works on mobile devices:
- **Touch-friendly**: Large buttons and inputs
- **Responsive layout**: Adapts to screen size
- **Mobile-optimized**: Works on tablets and phones

## 🔄 **API Versioning**

The API uses URL versioning:
- **Current version**: `/api/v1/`
- **Future versions**: `/api/v2/`, `/api/v3/`, etc.
- **Backward compatibility**: Maintained within major versions

## 📞 **Support**

For issues with the API documentation:
- Check the **ReDoc** alternative view
- Review the **OpenAPI JSON** schema
- Contact the development team
- Check the server logs for detailed errors

---

**Happy API Testing! 🚀** 