# Momentum - Time Tracking Platform

A comprehensive time tracking solution with desktop automation, web dashboard, and robust backend API.

## 🚀 Overview

Momentum is a full-stack time tracking platform designed for teams and organizations. It combines automated desktop time tracking with a powerful web-based management dashboard, providing complete visibility into employee productivity and project management.

## 🏗️ Architecture

### Backend API (`/backend`)
- **FastAPI** REST API with JWT authentication
- **PostgreSQL** database with SQLAlchemy ORM
- **Pydantic** schemas for data validation
- **CORS** enabled for cross-origin requests
- **Swagger/OpenAPI** documentation at `/docs`

### Desktop Client (`/clientapp`)
- **Electron** + **React** + **TypeScript**
- **Tailwind CSS** for styling
- Automated screenshot capture
- Cross-platform compatibility (Windows, macOS, Linux)
- Real-time time tracking with project/task assignment

### Web Dashboard (`/webapp`)
- **React** + **TypeScript** + **Vite**
- **Shadcn/ui** components with **Tailwind CSS**
- **React Router** for navigation
- **React Query** for API state management
- **Recharts** for data visualization
- Admin and employee role-based interfaces

## 🛠️ Key Features

- **Automated Time Tracking**: Desktop app captures screenshots and tracks active time
- **Project Management**: Create, assign, and monitor projects
- **Task Organization**: Break down projects into manageable tasks
- **Employee Management**: Add, assign, and track employee activities
- **Real-time Analytics**: Visualize productivity metrics and time distribution
- **Role-based Access**: Separate admin and employee interfaces
- **Screenshot Monitoring**: Automated desktop screenshots for accountability
- **Cross-platform**: Works on Windows, macOS, and Linux

## 🚀 Quick Start

### Backend Setup
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Desktop Client
```bash
cd clientapp
npm install
npm run dev
```

### Web Dashboard
```bash
cd webapp
npm install
npm run dev
```

## 📱 Screenshots

- Desktop time tracker with project selection
- Web dashboard with employee management
- Real-time analytics and reporting
- Screenshot monitoring interface

## 🛡️ Security

- JWT-based authentication
- Role-based access control
- Secure API endpoints
- CORS protection
- Input validation with Pydantic

## 📊 Tech Stack

**Backend**: FastAPI, PostgreSQL, SQLAlchemy, Pydantic, JWT
**Desktop**: Electron, React, TypeScript, Tailwind CSS
**Web**: React, TypeScript, Vite, Shadcn/ui, React Query
**DevOps**: Docker, Docker Compose


