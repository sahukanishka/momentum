# Momentum - Time Tracking Platform

A comprehensive time tracking solution with desktop app, web dashboard, and robust backend API.

## 🚀 Overview

Momentum is a full-stack time tracking platform designed for teams and organizations. It combines desktop  time tracking app with a powerful web-based management dashboard, providing complete visibility into employee productivity and project management.

## 🏗️ Architecture

[![](https://mermaid.ink/img/pako:eNplVF1vmzAU_SuWpU6tlLR8k_IwKZA9VGq0VGSLNGcPLtwmLMRGtlnXtf3vu5iwUpUnzjn34_hewzMtZAk0oTvFmz1ZL7aCEN3e9zCrKxDmagH6YGRD5k3TyYTMXZbVsjiQG3H1tTUkbY2R4udJ9FjGG9MqIHmhAITeS6MH0WeZrGsoDLlZTchyng1CwHIQJVlww4mRZL666XOQ3Ip3rjZw31mpq4KbSgrSF9i4bMkF3wH5cmxq-QSgr1ZK_sJWQ_ONx75X8Ehu5U6TTx_cfeyU8uLQmcpB_a4K0H2Z1GXz1uwH9lQ89djQuDM_sD47mRiTAVtzfRgzIVtXRyBrhR0rsRtLERsZHQsxW4E6VlrjEDTJ9oBm1UlcpOx8JbXZKcjvbhFenITcZ-dv9UhupOpmNkXh4v0Uzs76ZTzU8tGefO6S6fTzy7D5F3Rtac_S3_DsvBwPFQMiG-DbALveJRheYtX_yYHVunniTes2Cii5vYNN37BfK9LeG4mDHYPAgt7IXQvqye54aPJO-GCwi0hDW2eRWuCNgT8GwRhEFuT-CKSxBfEpjE7wu6pKmhjVwoQecV28g_S5C9tSPPQRtjTB1xIeeFubLd2KV0xruPgh5XHIVLLd7WnywGuNqG1whLCoON7StxAcL6hMtsLQxI1sCZo80z80mTqXTvf4jheEQRw4fhQ4YRhM6BNNri-jyL0O3Vk8C2PHdWYwjV8n9K_tLtq6nlAoK7wmy_5HYf8Xr_8AGjtLsQ?type=png)](https://mermaid.live/edit#pako:eNplVF1vmzAU_SuWpU6tlLR8k_IwKZA9VGq0VGSLNGcPLtwmLMRGtlnXtf3vu5iwUpUnzjn34_hewzMtZAk0oTvFmz1ZL7aCEN3e9zCrKxDmagH6YGRD5k3TyYTMXZbVsjiQG3H1tTUkbY2R4udJ9FjGG9MqIHmhAITeS6MH0WeZrGsoDLlZTchyng1CwHIQJVlww4mRZL666XOQ3Ip3rjZw31mpq4KbSgrSF9i4bMkF3wH5cmxq-QSgr1ZK_sJWQ_ONx75X8Ehu5U6TTx_cfeyU8uLQmcpB_a4K0H2Z1GXz1uwH9lQ89djQuDM_sD47mRiTAVtzfRgzIVtXRyBrhR0rsRtLERsZHQsxW4E6VlrjEDTJ9oBm1UlcpOx8JbXZKcjvbhFenITcZ-dv9UhupOpmNkXh4v0Uzs76ZTzU8tGefO6S6fTzy7D5F3Rtac_S3_DsvBwPFQMiG-DbALveJRheYtX_yYHVunniTes2Cii5vYNN37BfK9LeG4mDHYPAgt7IXQvqye54aPJO-GCwi0hDW2eRWuCNgT8GwRhEFuT-CKSxBfEpjE7wu6pKmhjVwoQecV28g_S5C9tSPPQRtjTB1xIeeFubLd2KV0xruPgh5XHIVLLd7WnywGuNqG1whLCoON7StxAcL6hMtsLQxI1sCZo80z80mTqXTvf4jheEQRw4fhQ4YRhM6BNNri-jyL0O3Vk8C2PHdWYwjV8n9K_tLtq6nlAoK7wmy_5HYf8Xr_8AGjtLsQ)

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


