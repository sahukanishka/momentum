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
  systemPreferences,
} from "electron";
import * as path from "path";
import * as fs from "fs";
import * as os from "os";

// Debug logging setup
const isDebugMode =
  process.argv.includes("--debug") || process.env.NODE_ENV === "development";
const logLevel = process.argv.includes("--verbose") ? "verbose" : "normal";

function log(
  message: string,
  level: "info" | "warn" | "error" | "debug" = "info"
) {
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [${level.toUpperCase()}]`;

  if (level === "debug" && !isDebugMode) return;

  console.log(`${prefix} ${message}`);
}

// Log startup information
log("Momentum Time Tracker starting...", "info");
log(`Debug mode: ${isDebugMode}`, "debug");
log(`Log level: ${logLevel}`, "debug");
log(`Node version: ${process.version}`, "debug");
log(`Platform: ${process.platform}`, "debug");
log(`Architecture: ${process.arch}`, "debug");

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

// Activity tracking intervals - only screenshot interval
let screenshotInterval: NodeJS.Timeout | null = null;

function createWindow() {
  log("Creating main window...", "info");

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

  log(`Window created with ID: ${mainWindow.id}`, "debug");

  // Load the app
  if (process.env.NODE_ENV === "development") {
    log("Loading development URL: http://localhost:3000", "info");
    mainWindow.loadURL("http://localhost:3000");
    mainWindow.webContents.openDevTools();
    log("DevTools opened", "debug");
  } else {
    // In production, load from the dist directory
    const indexPath = path.join(__dirname, "index.html");
    log(`Loading production build from: ${indexPath}`, "info");
    mainWindow.loadFile(indexPath);
  }

  // Show window when ready
  mainWindow.once("ready-to-show", () => {
    log("Window ready to show", "info");
    mainWindow?.show();
  });

  // Handle window errors
  mainWindow.webContents.on(
    "did-fail-load",
    (event, errorCode, errorDescription) => {
      log(`Failed to load: ${errorCode} - ${errorDescription}`, "error");
    }
  );

  // Handle successful load
  mainWindow.webContents.on("did-finish-load", () => {
    log("Window loaded successfully", "info");
  });

  // Handle window close
  mainWindow.on("closed", () => {
    log("Main window closed", "debug");
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
  log("Creating tray...", "info");

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
  log("Starting activity tracking (screenshots only)...", "info");

  // Start screenshot capture with activity details every 30 seconds
  screenshotInterval = setInterval(() => {
    captureScreenshotWithActivity();
  }, 30000); // Every 30 seconds

  // Initial capture
  captureScreenshotWithActivity();

  // Update tray menu
  updateTrayMenu();
}

function stopActivityTracking() {
  if (!isActivityTracking) return;

  isActivityTracking = false;
  log("Stopping activity tracking...", "info");

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

async function captureScreenshotWithActivity() {
  try {
    log("Capturing screenshot with activity data...", "debug");

    // Gather activity data
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

    log("Activity data gathered:", "debug");

    // Send to renderer process for screenshot capture with activity data
    mainWindow?.webContents.send(
      "capture-screenshot-with-activity",
      activityData
    );
  } catch (error) {
    log(`Screenshot capture with activity failed: ${error}`, "error");
  }
}

async function captureScreenshot() {
  try {
    // This will be handled by the renderer process via preload script
    log("Screenshot capture requested", "debug");
  } catch (error) {
    log(`Screenshot capture failed: ${error}`, "error");
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

// Check screen recording permission on macOS
function checkScreenRecordingPermission(): boolean {
  if (process.platform === "darwin") {
    try {
      // Check if screen recording permission is granted
      const hasPermission = systemPreferences.getMediaAccessStatus("screen");
      console.log("Screen recording permission status:", hasPermission);
      return hasPermission === "granted";
    } catch (error) {
      console.error("Error checking screen recording permission:", error);
      return false;
    }
  }
  return true; // On non-macOS platforms, assume permission is granted
}

// Check accessibility permission on macOS
function checkAccessibilityPermission(): boolean {
  if (process.platform === "darwin") {
    try {
      // Check if accessibility permission is granted
      const hasPermission =
        systemPreferences.isTrustedAccessibilityClient(false);
      console.log("Accessibility permission status:", hasPermission);
      return hasPermission;
    } catch (error) {
      console.error("Error checking accessibility permission:", error);
      return false;
    }
  }
  return true; // On non-macOS platforms, assume permission is granted
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

ipcMain.handle("get-activity-data", async () => {
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

    log("Activity data requested from renderer", "debug");
    return activityData;
  } catch (error) {
    log(`Error getting activity data: ${error}`, "error");
    return null;
  }
});

ipcMain.handle("get-active-application", getActiveApplication);
ipcMain.handle("get-active-window-title", getActiveWindowTitle);
ipcMain.handle("get-idle-time", getIdleTime);

ipcMain.handle("check-accessibility-permission", () => {
  return checkAccessibilityPermission();
});

ipcMain.handle("check-screen-recording-permission", () => {
  return checkScreenRecordingPermission();
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

// Screenshot and file operations
ipcMain.handle(
  "save-screenshot-to-downloads",
  async (event, imageData: string, fileName: string) => {
    try {
      const { app } = require("electron");
      const path = require("path");
      const fs = require("fs").promises;

      // Get download folder path
      const downloadPath = path.join(
        app.getPath("downloads"),
        "momentum-screenshots"
      );

      // Create directory if it doesn't exist
      try {
        await fs.mkdir(downloadPath, { recursive: true });
      } catch (mkdirError) {
        // Directory might already exist, continue
      }

      // Create full file path
      const filePath = path.join(downloadPath, fileName);

      // Convert base64 to buffer and save
      const base64Data = imageData.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64Data, "base64");

      await fs.writeFile(filePath, buffer);

      log(`Screenshot saved to: ${filePath}`, "info");

      return {
        success: true,
        filePath: filePath,
        fileName: fileName,
      };
    } catch (error) {
      log(`Error saving screenshot: ${error}`, "error");
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
);

ipcMain.handle("get-download-folder-path", () => {
  try {
    const { app } = require("electron");
    const path = require("path");
    const downloadPath = path.join(
      app.getPath("downloads"),
      "momentum-screenshots"
    );
    return downloadPath;
  } catch (error) {
    log(`Error getting download folder path: ${error}`, "error");
    return null;
  }
});

ipcMain.handle("list-screenshots-in-downloads", async () => {
  try {
    const { app } = require("electron");
    const path = require("path");
    const fs = require("fs").promises;

    const downloadPath = path.join(
      app.getPath("downloads"),
      "momentum-screenshots"
    );

    // Check if directory exists
    try {
      await fs.access(downloadPath);
    } catch {
      return []; // Directory doesn't exist, return empty array
    }

    // Read directory contents
    const files = await fs.readdir(downloadPath);

    // Filter for screenshot files and get file stats
    const screenshotFiles = [];
    for (const file of files) {
      if (
        file.toLowerCase().endsWith(".png") ||
        file.toLowerCase().endsWith(".jpg") ||
        file.toLowerCase().endsWith(".jpeg")
      ) {
        const filePath = path.join(downloadPath, file);
        const stats = await fs.stat(filePath);
        screenshotFiles.push({
          name: file,
          path: filePath,
          size: stats.size,
          created: stats.birthtime,
          modified: stats.mtime,
        });
      }
    }

    // Sort by creation date (newest first)
    screenshotFiles.sort((a, b) => b.created.getTime() - a.created.getTime());

    return screenshotFiles.map((file) => file.name);
  } catch (error) {
    log(`Error listing screenshots: ${error}`, "error");
    return [];
  }
});

ipcMain.handle("open-download-folder", async () => {
  try {
    const { app, shell } = require("electron");
    const path = require("path");

    const downloadPath = path.join(
      app.getPath("downloads"),
      "momentum-screenshots"
    );

    // Open the folder in the default file manager
    await shell.openPath(downloadPath);

    log(`Opened download folder: ${downloadPath}`, "info");
    return { success: true };
  } catch (error) {
    log(`Error opening download folder: ${error}`, "error");
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
});

ipcMain.handle("capture-screenshot-main", async () => {
  try {
    // First check if we have screen recording permission
    const hasScreenPermission = checkScreenRecordingPermission();

    if (!hasScreenPermission) {
      log("Screen recording permission not granted", "error");
      throw new Error(
        "Screen recording permission not granted. Please grant permission in System Preferences > Security & Privacy > Privacy > Screen Recording"
      );
    }

    // Use desktopCapturer in main process
    const { desktopCapturer } = require("electron");
    const sources = await desktopCapturer.getSources({
      types: ["screen"],
      thumbnailSize: { width: 1920, height: 1080 },
    });

    if (sources.length > 0) {
      const source = sources[0];
      const screenshotData = {
        timestamp: Date.now(),
        imageData: source.thumbnail.toDataURL(),
        windowTitle: source.name,
        applicationName: source.name,
      };

      log("Screenshot captured successfully", "info");
      return screenshotData;
    }

    throw new Error("No screen sources available");
  } catch (error) {
    log(`Screenshot capture failed: ${error}`, "error");
    throw error;
  }
});

ipcMain.handle("get-screen-sources-main", async () => {
  try {
    // First check if we have screen recording permission
    const hasScreenPermission = checkScreenRecordingPermission();

    if (!hasScreenPermission) {
      log("Screen recording permission not granted", "error");
      return [];
    }

    // Use desktopCapturer in main process
    const { desktopCapturer } = require("electron");
    const sources = await desktopCapturer.getSources({
      types: ["screen"],
      thumbnailSize: { width: 100, height: 100 },
    });

    log(`Found ${sources.length} screen sources`, "info");
    return sources;
  } catch (error) {
    log(`Failed to get screen sources: ${error}`, "error");
    return [];
  }
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
