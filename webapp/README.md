# Momentum - Employee Productivity & Time Tracking Platform

A modern React/TypeScript web application for organization management, project tracking, and employee productivity monitoring.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Backend API running on `http://127.0.0.1:8000`

### Setup & Run
```bash
# Clone repository
git clone <repository-url>
cd webapp

# Install dependencies
npm install

# Start development server
npm run dev
```

Access the application at `http://localhost:8080`

## 🛠 Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite + SWC
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: React Context API
- **Routing**: React Router DOM
- **HTTP Client**: Axios + TanStack Query
- **Forms**: React Hook Form + Zod
- **UI**: Radix UI + Lucide Icons
- **Notifications**: Sonner

## 📁 File Structure

```
src/
├── api/                    # API layer & endpoints
├── components/            # Reusable UI components
│   ├── ui/               # shadcn/ui components
│   └── *.tsx            # Custom components
├── context/              # Auth & global state
├── pages/                # Page components
│   ├── admin/           # Admin dashboard pages
│   └── employee/        # Employee interface pages
├── routes/               # Routing configuration
└── utils/                # Utility functions
```

## 🏗 Architecture

### Core Features
- **Role-based Access**: Admin/Employee interfaces
- **Multi-tenant**: Organization management
- **Real-time Monitoring**: Screenshot tracking
- **Project Management**: Task assignment & tracking
- **Time Tracking**: Work hour monitoring

### Key Components
- `AuthProvider`: JWT authentication with localStorage
- `ProtectedRoute`: Role-based route protection
- `Dashboard`: Role-specific statistics & actions
- `Sidebar`: Collapsible navigation menu
- API integration with automatic token refresh

### Data Flow
1. **Authentication**: Login → JWT tokens → Role-based routing
2. **API Calls**: Axios interceptors → Error handling → Toast notifications
3. **State Management**: Context API → useReducer → Local storage persistence

## 🔧 Development

```bash
# Available scripts
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

## 📱 Features

### Admin Dashboard
- Employee management (CRUD)
- Project creation & assignment
- Task management
- Time tracking overview
- Activity monitoring
- Organization settings

### Employee Interface
- Personal task management
- Time tracking
- Project overview
- Profile management

## 🔐 Authentication

Demo credentials: Any email/password combination
- Admin role: Full access to all features
- Employee role: Limited to personal workspace

## 🌐 API Integration

Backend endpoints for:
- Authentication (login/logout)
- Employee management
- Project & task operations
- Time tracking
- Screenshot monitoring
- Organization management

## 🎨 UI/UX

- **Responsive Design**: Mobile-first approach
- **Theme Support**: Dark/light mode toggle
- **Modern UI**: shadcn/ui components
- **Loading States**: Skeleton screens & progress indicators
- **Error Handling**: User-friendly error messages
# Updated Tue Jun 24 12:41:32 IST 2025
