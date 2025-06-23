import { s3UploadService } from "./S3UploadService";

interface ScreenshotData {
  imageData: string;
  timestamp: number;
  fileName: string;
  filePath: string;
}

class MainService {
  /**
   * Captures a screenshot and saves it to the download folder
   * @param fileName Optional custom filename (without extension)
   * @returns Promise<ScreenshotData> with screenshot information
   */
  async captureAndSaveScreenshot(fileName?: string): Promise<ScreenshotData> {
    try {
      console.log("Capturing screenshot...");

      // Check if Electron API is available
      if (!(window as any).electronAPI) {
        throw new Error("Electron API not available");
      }

      // Capture screenshot using Electron API
      const screenshotData = await (
        window as any
      ).electronAPI.captureScreenshot();

      if (!screenshotData || !screenshotData.imageData) {
        throw new Error(
          "Failed to capture screenshot - no image data received"
        );
      }

      console.log("Screenshot captured, saving to downloads...");

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, "_");
      const defaultFileName = `screenshot_${timestamp}`;
      const finalFileName = fileName
        ? `${fileName}_${timestamp}`
        : defaultFileName;

      // Save to download folder using Electron API
      const saveResult = await (
        window as any
      ).electronAPI.saveScreenshotToDownloads(
        screenshotData.imageData,
        `${finalFileName}.png`
      );

      if (!saveResult.success) {
        throw new Error(saveResult.error || "Failed to save screenshot");
      }

      console.log("Screenshot saved successfully:", saveResult.filePath);

      return {
        imageData: screenshotData.imageData,
        timestamp: Date.now(),
        fileName: `${finalFileName}.png`,
        filePath: saveResult.filePath,
      };
    } catch (error) {
      console.error("Error capturing and saving screenshot:", error);
      throw error;
    }
  }

  /**
   * Captures screenshot and uploads to S3 with activity data
   * @param authData Authentication and tracking data
   * @returns Promise with upload result
   */
  async captureAndUploadScreenshot(authData: {
    employee_id: string;
    organization_id: string;
    tracking_id: string;
    project_id?: string;
    task_id?: string;
  }) {
    try {
      // First capture the screenshot
      const screenshotData = await this.captureAndSaveScreenshot();

      // Then upload to S3
      const uploadResult = await s3UploadService.uploadScreenshot(
        screenshotData.imageData,
        authData
      );

      return {
        localSave: screenshotData,
        upload: uploadResult,
      };
    } catch (error) {
      console.error("Error in capture and upload:", error);
      throw error;
    }
  }

  /**
   * Gets the download folder path
   * @returns Promise<string> download folder path
   */
  async getDownloadFolderPath(): Promise<string> {
    try {
      const path = await (window as any).electronAPI.getDownloadFolderPath();
      return path;
    } catch (error) {
      console.error("Error getting download folder path:", error);
      throw error;
    }
  }

  /**
   * Lists all screenshots in the download folder
   * @returns Promise<string[]> array of screenshot filenames
   */
  async listScreenshotsInDownloads(): Promise<string[]> {
    try {
      const screenshots = await (
        window as any
      ).electronAPI.listScreenshotsInDownloads();
      return screenshots;
    } catch (error) {
      console.error("Error listing screenshots:", error);
      throw error;
    }
  }
}

export const mainService = new MainService();
export default MainService;
