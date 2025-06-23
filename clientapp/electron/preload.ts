import { contextBridge, ipcRenderer } from "electron";

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld("electronAPI", {
  startTracking: () => ipcRenderer.invoke("start-tracking"),
  stopTracking: () => ipcRenderer.invoke("stop-tracking"),
  getTimeData: () => ipcRenderer.invoke("get-time-data"),
  onTimeUpdate: (callback: (data: any) => void) => {
    ipcRenderer.on("time-update", (event, data) => callback(data));
  },
});
