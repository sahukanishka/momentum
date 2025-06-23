const { app, BrowserWindow } = require("electron");
const path = require("path");

function createWindow() {
  console.log("Creating test window...");

  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  win.loadFile(path.join(__dirname, "dist", "index.html"));

  win.once("ready-to-show", () => {
    console.log("Test window ready!");
    win.show();
  });
}

app.whenReady().then(() => {
  console.log("Test app ready!");
  createWindow();
});

app.on("window-all-closed", () => {
  app.quit();
});
