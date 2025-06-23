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
      // First check if we have screen recording permission
      const hasScreenPermission = await ipcRenderer.invoke(
        "check-screen-recording-permission"
      );

      if (!hasScreenPermission) {
        console.error("Screen recording permission not granted");
        throw new Error(
          "Screen recording permission not granted. Please grant permission in System Preferences > Security & Privacy > Privacy > Screen Recording"
        );
      }

      const sources = await desktopCapturer.getSources({
        types: ["screen"],
        thumbnailSize: { width: 1920, height: 1080 },
      });

      if (sources.length > 0) {
        const source = sources[0];
        return {
          timestamp: Date.now(),
          imageData: source.thumbnail.toDataURL(),
          windowTitle: source.name,
          applicationName: source.name,
        };
      }
      return null;
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
      // First check if we have screen recording permission
      const hasScreenPermission = await ipcRenderer.invoke(
        "check-screen-recording-permission"
      );

      if (!hasScreenPermission) {
        console.error("Screen recording permission not granted");
        return [];
      }

      const sources = await desktopCapturer.getSources({
        types: ["screen"],
        thumbnailSize: { width: 100, height: 100 },
      });
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
});
