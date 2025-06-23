import { contextBridge, ipcRenderer, desktopCapturer, screen } from "electron";

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld("electronAPI", {
  // Time tracking
  startTracking: () => ipcRenderer.invoke("start-tracking"),
  stopTracking: () => ipcRenderer.invoke("stop-tracking"),
  getTimeData: () => ipcRenderer.invoke("get-time-data"),
  onTimeUpdate: (callback: (data: any) => void) => {
    ipcRenderer.on("time-update", (event, data) => callback(data));
  },

  // Screenshot and activity tracking
  captureScreenshot: async () => {
    try {
      // Use IPC to capture screenshot from main process
      const screenshotData = await ipcRenderer.invoke(
        "capture-screenshot-main"
      );
      return screenshotData;
    } catch (error) {
      console.error("Screenshot capture failed:", error);
      throw error; // Re-throw to let the renderer handle it
    }
  },

  getActivityData: async () => {
    try {
      const mousePosition = screen.getCursorScreenPoint();
      const primaryDisplay = screen.getPrimaryDisplay();

      return {
        timestamp: Date.now(),
        mousePosition: {
          x: mousePosition.x,
          y: mousePosition.y,
        },
        keyboardActivity: await ipcRenderer.invoke("get-keyboard-activity"),
        applicationName: await ipcRenderer.invoke("get-active-application"),
        windowTitle: await ipcRenderer.invoke("get-active-window-title"),
        idleTime: await ipcRenderer.invoke("get-idle-time"),
      };
    } catch (error) {
      console.error("Activity data collection failed:", error);
      return null;
    }
  },

  // Permission requests
  getScreenSources: async () => {
    try {
      // Use IPC to get screen sources from main process
      const sources = await ipcRenderer.invoke("get-screen-sources-main");
      return sources;
    } catch (error) {
      console.error("Failed to get screen sources:", error);
      return [];
    }
  },

  checkAccessibilityPermission: () =>
    ipcRenderer.invoke("check-accessibility-permission"),

  checkScreenRecordingPermission: () =>
    ipcRenderer.invoke("check-screen-recording-permission"),

  requestAccessibilityPermission: () =>
    ipcRenderer.invoke("request-accessibility-permission"),

  // System preferences
  openSystemPreferences: (permissionType: string) =>
    ipcRenderer.invoke("open-system-preferences", permissionType),

  // Activity tracking control
  startActivityTracking: () => ipcRenderer.invoke("start-activity-tracking"),
  stopActivityTracking: () => ipcRenderer.invoke("stop-activity-tracking"),
  getTrackingStatus: () => ipcRenderer.invoke("get-tracking-status"),

  // Listen for screenshot with activity capture requests
  onCaptureScreenshotWithActivity: (callback: (activityData: any) => void) => {
    ipcRenderer.on(
      "capture-screenshot-with-activity",
      (event, activityData) => {
        callback(activityData);
      }
    );
  },

  // System information
  getSystemInfo: () => ipcRenderer.invoke("get-system-info"),
  getActiveWindowInfo: () => ipcRenderer.invoke("get-active-window-info"),

  // Screenshot and file operations
  saveScreenshotToDownloads: (imageData: string, fileName: string) =>
    ipcRenderer.invoke("save-screenshot-to-downloads", imageData, fileName),

  getDownloadFolderPath: () => ipcRenderer.invoke("get-download-folder-path"),

  listScreenshotsInDownloads: () =>
    ipcRenderer.invoke("list-screenshots-in-downloads"),

  openDownloadFolder: () => ipcRenderer.invoke("open-download-folder"),
});
