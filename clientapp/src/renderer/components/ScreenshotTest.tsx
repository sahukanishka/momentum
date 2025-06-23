import React, { useState } from "react";
import { mainService } from "../services/MainService";

const ScreenshotTest: React.FC = () => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [lastScreenshot, setLastScreenshot] = useState<any>(null);
  const [downloadPath, setDownloadPath] = useState<string>("");
  const [screenshots, setScreenshots] = useState<string[]>([]);

  const captureScreenshot = async () => {
    try {
      setIsCapturing(true);
      console.log("Starting screenshot capture...");

      const result = await mainService.captureAndSaveScreenshot(
        "test_screenshot"
      );

      setLastScreenshot(result);
      console.log("Screenshot captured and saved:", result);

      // Refresh the list of screenshots
      await loadScreenshots();
    } catch (error) {
      console.error("Error capturing screenshot:", error);
      alert(`Error capturing screenshot: ${error}`);
    } finally {
      setIsCapturing(false);
    }
  };

  const loadDownloadPath = async () => {
    try {
      const path = await mainService.getDownloadFolderPath();
      setDownloadPath(path);
    } catch (error) {
      console.error("Error loading download path:", error);
    }
  };

  const loadScreenshots = async () => {
    try {
      const files = await mainService.listScreenshotsInDownloads();
      setScreenshots(files);
    } catch (error) {
      console.error("Error loading screenshots:", error);
    }
  };

  const openDownloadFolder = async () => {
    try {
      await (window as any).electronAPI.openDownloadFolder();
    } catch (error) {
      console.error("Error opening download folder:", error);
    }
  };

  React.useEffect(() => {
    loadDownloadPath();
    loadScreenshots();
  }, []);

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
        <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
        Screenshot Test
      </h3>

      <div className="space-y-4">
        {/* Download Path Display */}
        <div className="bg-gray-50 rounded-lg p-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Download Folder:
          </label>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-600 font-mono bg-white px-2 py-1 rounded border flex-1 truncate">
              {downloadPath || "Loading..."}
            </span>
            <button
              onClick={openDownloadFolder}
              className="text-xs bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded transition-colors"
            >
              Open
            </button>
          </div>
        </div>

        {/* Capture Button */}
        <div className="flex space-x-3">
          <button
            onClick={captureScreenshot}
            disabled={isCapturing}
            className={`flex-1 font-medium py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl ${
              isCapturing
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
            }`}
          >
            {isCapturing ? "Capturing..." : "Capture Screenshot"}
          </button>

          <button
            onClick={loadScreenshots}
            className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
          >
            Refresh
          </button>
        </div>

        {/* Last Screenshot Info */}
        {lastScreenshot && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <h4 className="text-sm font-medium text-green-800 mb-2">
              Last Screenshot Captured:
            </h4>
            <div className="space-y-1 text-xs text-green-700">
              <div>
                <strong>File:</strong> {lastScreenshot.fileName}
              </div>
              <div>
                <strong>Path:</strong> {lastScreenshot.filePath}
              </div>
              <div>
                <strong>Time:</strong>{" "}
                {new Date(lastScreenshot.timestamp).toLocaleString()}
              </div>
            </div>
          </div>
        )}

        {/* Screenshots List */}
        <div className="bg-gray-50 rounded-lg p-3">
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            Screenshots in Downloads ({screenshots.length}):
          </h4>
          {screenshots.length > 0 ? (
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {screenshots.map((file, index) => (
                <div
                  key={index}
                  className="text-xs text-gray-600 bg-white px-2 py-1 rounded border"
                >
                  {file}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-xs text-gray-500 italic">
              No screenshots found
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <h4 className="text-sm font-medium text-blue-800 mb-2">
            How it works:
          </h4>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>
              • Screenshots are saved to:{" "}
              <code>~/Downloads/momentum-screenshots/</code>
            </li>
            <li>
              • Files are named with timestamp:{" "}
              <code>screenshot_YYYY-MM-DD_HH_MM_SS.png</code>
            </li>
            <li>• You can provide a custom prefix for the filename</li>
            <li>• Click "Open" to view the download folder in Finder</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ScreenshotTest;
