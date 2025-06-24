# Momentum Time Tracker

A desktop application for time tracking and activity monitoring built with Electron, React, and TypeScript.

## 🚀 Quick Setup

### Prerequisites
- Node.js (v16+)
- npm or yarn

### Installation & Run
```bash
# Install dependencies
npm install

# Development mode
npm run dev

# Build for production
npm run build

# Build and package
npm run build:prod
```

## 🏗️ Architecture

### Main Process (Electron)
- **File**: `electron/main.ts`
- **Responsibilities**: Window management, system permissions, screenshot capture, file operations
- **Key Features**: Screen recording permission handling, desktop capture, file system access

### Renderer Process (React)
- **File**: `src/renderer/App.tsx`
- **Responsibilities**: UI components, timer logic, API communication
- **Key Features**: Timer controls, task selection, activity tracking

### Services Layer
- **API Service**: `src/renderer/services/Api.ts` - Backend communication
- **S3 Upload Service**: `src/renderer/services/S3UploadService.ts` - AWS S3 integration
- **Main Service**: `src/renderer/services/MainService.ts` - Screenshot capture & file operations

## 📁 File Structure
```
clientapp/
├── electron/                 # Main process
│   ├── main.ts              # Electron main process
│   ├── preload.ts           # Preload script
│   └── tsconfig.json        # TypeScript config
├── src/renderer/            # Renderer process
│   ├── components/          # React components
│   ├── services/            # Business logic services
│   ├── contexts/            # React contexts
│   └── App.tsx              # Main app component
├── package.json             # Dependencies & scripts
└── vite.config.js           # Build configuration
```

## 🛠️ Tech Stack
- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Desktop**: Electron 27
- **Build Tool**: Vite
- **Package Manager**: npm
- **State Management**: React Context API
- **UI Components**: Custom components with Tailwind

## 🔧 Key Features
- **Time Tracking**: Start/stop timer with project/task selection
- **Screenshot Capture**: Automatic screenshots every 30 seconds
- **Activity Monitoring**: System information collection
- **AWS Integration**: S3 upload with presigned URLs
- **Backend API**: Clock-in/out and screenshot upload endpoints
- **Permission Management**: macOS screen recording & accessibility

## 🔐 Permissions Required
- **Screen Recording**: For screenshot capture
- **Accessibility**: For activity monitoring (macOS)

## 📡 API Endpoints
- `POST /api/v1/time-tracking/clock-in/{employeeId}` - Start tracking
- `POST /api/v1/time-tracking/clock-out/{employeeId}` - Stop tracking
- `POST /api/v1/screenshots/s3/presigned-url` - Get S3 upload URL
- `POST /api/v1/screenshots/upload` - Upload activity data
- `GET /api/v1/tasks/employee/{employeeId}` - Get employee tasks 