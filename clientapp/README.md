# Momentum Time Tracker

A cross-platform desktop time tracking application built with Electron, React, TypeScript, and Tailwind CSS. This app provides a simple and elegant interface for tracking time spent on different projects and tasks.

## Features

- ⏱️ **Real-time Timer**: Start and stop time tracking with a clean interface
- 📊 **Project Management**: Organize time entries by different projects
- 📝 **Task Descriptions**: Add detailed descriptions to your time entries
- 📈 **Time History**: View your recent time tracking history
- 🖥️ **System Tray**: Runs in the background with system tray integration
- 🎨 **Modern UI**: Beautiful interface built with Tailwind CSS

## Tech Stack

- **Electron**: Cross-platform desktop app framework
- **React**: UI library for building user interfaces
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **Vite**: Fast build tool and development server

## Project Structure

```
/clientapp
├── src/
│   ├── main.ts (Electron)
│   ├── preload.ts
│   └── renderer/
│       ├── App.tsx
│       ├── components/
│       ├── services/
│       ├── hooks/
├── public/
├── package.json
└── vite.config.js
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd clientapp
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

This will start both the Vite development server and the Electron app.

### Building for Production

To build the app for production:

```bash
npm run build
```

The built files will be in the `dist` directory.

## Development

- **Development Mode**: `npm run dev` - Starts both Vite dev server and Electron
- **Build**: `npm run build` - Builds the app for production
- **Preview**: `npm run preview` - Preview the built app

## Usage

1. **Start the App**: The app will appear in your system tray
2. **Show/Hide**: Click the tray icon to show or hide the app window
3. **Select Project**: Choose a project from the dropdown
4. **Add Description**: Enter what you're working on
5. **Start Timer**: Click "Start Timer" to begin tracking
6. **Stop Timer**: Click "Stop Timer" to end the session
7. **View History**: See your recent time entries at the bottom

## System Tray Features

- **Show App**: Display the main window
- **Start/Stop Tracking**: Quick access to timer controls
- **Quit**: Close the application completely

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License. 