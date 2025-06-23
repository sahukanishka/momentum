import { app, BrowserWindow, Tray, Menu, nativeImage } from "electron";
import * as path from "path";

// Extend the App interface to include isQuiting property
declare global {
  namespace NodeJS {
    interface Global {
      isQuiting: boolean;
    }
  }
}

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let isQuiting = false;

function createWindow() {
  console.log("Creating window...");

  mainWindow = new BrowserWindow({
    width: 400,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
    show: true,
    frame: true, // Show frame for debugging
    resizable: false,
    skipTaskbar: false,
    alwaysOnTop: false,
    center: true, // Center the window
    title: "Momentum Time Tracker",
  });

  // Load the app
  if (process.env.NODE_ENV === "development") {
    console.log("Loading development URL...");
    mainWindow.loadURL("http://localhost:3000");
    mainWindow.webContents.openDevTools();
  } else {
    // In production, load from the dist directory
    const indexPath = path.join(__dirname, "index.html");
    console.log("Loading from:", indexPath);
    mainWindow.loadFile(indexPath);
  }

  // Show window when ready
  mainWindow.once("ready-to-show", () => {
    console.log("Window ready to show");
    mainWindow?.show();
  });

  // Handle window errors
  mainWindow.webContents.on(
    "did-fail-load",
    (event, errorCode, errorDescription) => {
      console.error("Failed to load:", errorCode, errorDescription);
    }
  );

  // Handle successful load
  mainWindow.webContents.on("did-finish-load", () => {
    console.log("Window loaded successfully");
  });

  // Handle window close
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

function createTray() {
  console.log("Creating tray...");

  // Create a simple icon (you can replace this with your own icon)
  const icon = nativeImage.createFromDataURL(
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
  );

  tray = new Tray(icon);

  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Show App",
      click: () => {
        mainWindow?.show();
        mainWindow?.focus();
      },
    },
    {
      label: "Quit",
      click: () => {
        isQuiting = true;
        app.quit();
      },
    },
  ]);

  tray.setContextMenu(contextMenu);
  tray.setToolTip("Momentum Time Tracker");

  // Show window when tray icon is clicked
  tray.on("click", () => {
    mainWindow?.show();
    mainWindow?.focus();
  });
}

app.whenReady().then(() => {
  console.log("App ready, creating window and tray...");
  createWindow();
  createTray();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Prevent multiple instances
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on("second-instance", () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}
