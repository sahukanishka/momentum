import {
  app,
  BrowserWindow,
  Tray,
  Menu,
  nativeImage,
  ipcMain,
  screen,
  globalShortcut,
  shell,
} from "electron";
import * as path from "path";
import * as fs from "fs";
import * as os from "os";

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
let isActivityTracking = false;
let lastKeyboardActivity = Date.now();
let lastMouseActivity = Date.now();
let keyboardActivityCount = 0;
let mouseActivityCount = 0;

// Activity tracking intervals
let activityTrackingInterval: NodeJS.Timeout | null = null;
let screenshotInterval: NodeJS.Timeout | null = null;

function createWindow() {
  console.log("Creating window...");

  mainWindow = new BrowserWindow({
    width: 400,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
      webSecurity: false, // Allow screen capture
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

  // Setup global shortcuts for activity tracking
  setupGlobalShortcuts();
}

function setupGlobalShortcuts() {
  // Track keyboard activity
  globalShortcut.register("CommandOrControl+Shift+A", () => {
    lastKeyboardActivity = Date.now();
    keyboardActivityCount++;
  });

  // Track mouse activity (this is a simplified approach)
  setInterval(() => {
    const currentTime = Date.now();
    if (currentTime - lastMouseActivity > 1000) {
      // Check every second
      const mousePosition = screen.getCursorScreenPoint();
      // If mouse position changed, consider it activity
      lastMouseActivity = currentTime;
      mouseActivityCount++;
    }
  }, 1000);
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
      label: "Start Activity Tracking",
      click: () => {
        startActivityTracking();
      },
    },
    {
      label: "Stop Activity Tracking",
      click: () => {
        stopActivityTracking();
      },
    },
    { type: "separator" },
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

function startActivityTracking() {
  if (isActivityTracking) return;

  isActivityTracking = true;
  console.log("Starting activity tracking...");

  // Start activity monitoring
  activityTrackingInterval = setInterval(() => {
    trackActivity();
  }, 5000); // Every 5 seconds

  // Start screenshot capture
  screenshotInterval = setInterval(() => {
    captureScreenshot();
  }, 30000); // Every 30 seconds

  // Update tray menu
  updateTrayMenu();
}

function stopActivityTracking() {
  if (!isActivityTracking) return;

  isActivityTracking = false;
  console.log("Stopping activity tracking...");

  if (activityTrackingInterval) {
    clearInterval(activityTrackingInterval);
    activityTrackingInterval = null;
  }

  if (screenshotInterval) {
    clearInterval(screenshotInterval);
    screenshotInterval = null;
  }

  // Update tray menu
  updateTrayMenu();
}

function updateTrayMenu() {
  if (!tray) return;

  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Show App",
      click: () => {
        mainWindow?.show();
        mainWindow?.focus();
      },
    },
    {
      label: isActivityTracking
        ? "Stop Activity Tracking"
        : "Start Activity Tracking",
      click: () => {
        if (isActivityTracking) {
          stopActivityTracking();
        } else {
          startActivityTracking();
        }
      },
    },
    { type: "separator" },
    {
      label: "Quit",
      click: () => {
        isQuiting = true;
        app.quit();
      },
    },
  ]);

  tray.setContextMenu(contextMenu);
}

async function trackActivity() {
  try {
    const activityData = {
      timestamp: Date.now(),
      mousePosition: screen.getCursorScreenPoint(),
      keyboardActivity: Date.now() - lastKeyboardActivity < 5000, // Active if keyboard used in last 5 seconds
      applicationName: await getActiveApplication(),
      windowTitle: await getActiveWindowTitle(),
      idleTime: await getIdleTime(),
      keyboardActivityCount,
      mouseActivityCount,
    };

    console.log("Activity tracked:", activityData);

    // Send to renderer process
    mainWindow?.webContents.send("activity-update", activityData);
  } catch (error) {
    console.error("Activity tracking failed:", error);
  }
}

async function captureScreenshot() {
  try {
    // This will be handled by the renderer process via preload script
    console.log("Screenshot capture requested");
  } catch (error) {
    console.error("Screenshot capture failed:", error);
  }
}

async function getActiveApplication(): Promise<string> {
  try {
    // This is a simplified approach - in a real app you'd use more sophisticated methods
    return "Unknown Application";
  } catch (error) {
    return "Unknown Application";
  }
}

async function getActiveWindowTitle(): Promise<string> {
  try {
    // This is a simplified approach - in a real app you'd use more sophisticated methods
    return "Unknown Window";
  } catch (error) {
    return "Unknown Window";
  }
}

async function getIdleTime(): Promise<number> {
  try {
    const currentTime = Date.now();
    const lastActivity = Math.max(lastKeyboardActivity, lastMouseActivity);
    return currentTime - lastActivity;
  } catch (error) {
    return 0;
  }
}

async function openSystemPreferences(permissionType: string) {
  try {
    if (process.platform === "darwin") {
      // macOS - open specific system preferences panes
      if (permissionType === "screen") {
        // Open Screen Recording preferences
        await shell.openExternal(
          "x-apple.systempreferences:com.apple.preference.security?Privacy_ScreenCapture"
        );
      } else if (permissionType === "accessibility") {
        // Open Accessibility preferences
        await shell.openExternal(
          "x-apple.systempreferences:com.apple.preference.security?Privacy_Accessibility"
        );
      } else {
        // Open general Security & Privacy preferences
        await shell.openExternal(
          "x-apple.systempreferences:com.apple.preference.security?Privacy"
        );
      }
    } else {
      // For other platforms, open general system preferences
      await shell.openExternal(
        "x-apple.systempreferences:com.apple.preference.security?Privacy"
      );
    }
  } catch (error) {
    console.error("Error opening system preferences:", error);
    // Fallback: try to open general system preferences
    try {
      await shell.openExternal(
        "x-apple.systempreferences:com.apple.preference.security?Privacy"
      );
    } catch (fallbackError) {
      console.error(
        "Fallback error opening system preferences:",
        fallbackError
      );
    }
  }
}

// IPC Handlers
ipcMain.handle("get-keyboard-activity", () => {
  return Date.now() - lastKeyboardActivity < 5000;
});

ipcMain.handle("get-active-application", getActiveApplication);
ipcMain.handle("get-active-window-title", getActiveWindowTitle);
ipcMain.handle("get-idle-time", getIdleTime);

ipcMain.handle("check-accessibility-permission", () => {
  // This would check if accessibility permission is granted
  // For now, return true (you'd implement proper permission checking)
  return true;
});

ipcMain.handle("request-accessibility-permission", () => {
  // This would request accessibility permission
  // For now, return true (you'd implement proper permission requesting)
  return true;
});

ipcMain.handle("open-system-preferences", async (event, permissionType) => {
  await openSystemPreferences(permissionType);
});

ipcMain.handle("start-activity-tracking", () => {
  startActivityTracking();
  return true;
});

ipcMain.handle("stop-activity-tracking", () => {
  stopActivityTracking();
  return true;
});

ipcMain.handle("get-tracking-status", () => {
  return isActivityTracking;
});

ipcMain.handle("get-system-info", () => {
  return {
    platform: os.platform(),
    arch: os.arch(),
    hostname: os.hostname(),
    username: os.userInfo().username,
    uptime: os.uptime(),
  };
});

ipcMain.handle("get-active-window-info", () => {
  return {
    title: mainWindow?.getTitle() || "Unknown",
    isVisible: mainWindow?.isVisible() || false,
    isFocused: mainWindow?.isFocused() || false,
  };
});

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

// Cleanup on app quit
app.on("before-quit", () => {
  stopActivityTracking();
  globalShortcut.unregisterAll();
});
