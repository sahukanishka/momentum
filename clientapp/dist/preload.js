"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
electron_1.contextBridge.exposeInMainWorld("electronAPI", {
    // Time tracking
    startTracking: () => electron_1.ipcRenderer.invoke("start-tracking"),
    stopTracking: () => electron_1.ipcRenderer.invoke("stop-tracking"),
    getTimeData: () => electron_1.ipcRenderer.invoke("get-time-data"),
    onTimeUpdate: (callback) => {
        electron_1.ipcRenderer.on("time-update", (event, data) => callback(data));
    },
    // Screenshot and activity tracking
    captureScreenshot: async () => {
        try {
            // Use IPC to capture screenshot from main process
            const screenshotData = await electron_1.ipcRenderer.invoke("capture-screenshot-main");
            return screenshotData;
        }
        catch (error) {
            console.error("Screenshot capture failed:", error);
            throw error; // Re-throw to let the renderer handle it
        }
    },
    getActivityData: async () => {
        try {
            const mousePosition = electron_1.screen.getCursorScreenPoint();
            const primaryDisplay = electron_1.screen.getPrimaryDisplay();
            return {
                timestamp: Date.now(),
                mousePosition: {
                    x: mousePosition.x,
                    y: mousePosition.y,
                },
                keyboardActivity: await electron_1.ipcRenderer.invoke("get-keyboard-activity"),
                applicationName: await electron_1.ipcRenderer.invoke("get-active-application"),
                windowTitle: await electron_1.ipcRenderer.invoke("get-active-window-title"),
                idleTime: await electron_1.ipcRenderer.invoke("get-idle-time"),
            };
        }
        catch (error) {
            console.error("Activity data collection failed:", error);
            return null;
        }
    },
    // Permission requests
    getScreenSources: async () => {
        try {
            // Use IPC to get screen sources from main process
            const sources = await electron_1.ipcRenderer.invoke("get-screen-sources-main");
            return sources;
        }
        catch (error) {
            console.error("Failed to get screen sources:", error);
            return [];
        }
    },
    checkAccessibilityPermission: () => electron_1.ipcRenderer.invoke("check-accessibility-permission"),
    checkScreenRecordingPermission: () => electron_1.ipcRenderer.invoke("check-screen-recording-permission"),
    requestAccessibilityPermission: () => electron_1.ipcRenderer.invoke("request-accessibility-permission"),
    // System preferences
    openSystemPreferences: (permissionType) => electron_1.ipcRenderer.invoke("open-system-preferences", permissionType),
    // Activity tracking control
    startActivityTracking: () => electron_1.ipcRenderer.invoke("start-activity-tracking"),
    stopActivityTracking: () => electron_1.ipcRenderer.invoke("stop-activity-tracking"),
    getTrackingStatus: () => electron_1.ipcRenderer.invoke("get-tracking-status"),
    // Listen for screenshot with activity capture requests
    onCaptureScreenshotWithActivity: (callback) => {
        electron_1.ipcRenderer.on("capture-screenshot-with-activity", (event, activityData) => {
            callback(activityData);
        });
    },
    // System information
    getSystemInfo: () => electron_1.ipcRenderer.invoke("get-system-info"),
    getActiveWindowInfo: () => electron_1.ipcRenderer.invoke("get-active-window-info"),
    // Screenshot and file operations
    saveScreenshotToDownloads: (imageData, fileName) => electron_1.ipcRenderer.invoke("save-screenshot-to-downloads", imageData, fileName),
    getDownloadFolderPath: () => electron_1.ipcRenderer.invoke("get-download-folder-path"),
    listScreenshotsInDownloads: () => electron_1.ipcRenderer.invoke("list-screenshots-in-downloads"),
    openDownloadFolder: () => electron_1.ipcRenderer.invoke("open-download-folder"),
});
