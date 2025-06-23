import {
  getPresignedUrl,
  uploadScreenshot as uploadScreenshotApi,
} from "./Api";

interface S3UploadResponse {
  success: boolean;
  url?: string;
  path?: string;
  error?: string;
}

interface ScreenshotUploadData {
  employee_id: string;
  organization_id: string;
  path: string;
  permission: boolean;
  os: string;
  geo_location: string;
  ip_address: string;
  app: string;
  tracking_id: string;
  project_id?: string;
  task_id?: string;
}

class S3UploadService {
  private async uploadToS3(
    imageData: string,
    fileName: string
  ): Promise<S3UploadResponse> {
    try {
      const presignedData: any = await getPresignedUrl(fileName);
      const uploadUrl = presignedData?.data?.data?.uploadUrl;

      console.log("Presigned URL response:", presignedData);

      if (!uploadUrl) {
        throw new Error("No upload URL received from presigned URL API");
      }

      // Upload to S3 using presigned URL
      const uploadResponse = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": "image/png",
        },
        body: this.base64ToBlob(imageData),
      });

      if (!uploadResponse.ok) {
        throw new Error(`S3 upload failed: ${uploadResponse.statusText}`);
      }

      return {
        success: true,
        url: presignedData.data.data.url,
        path: presignedData.data.data.path,
      };
    } catch (error) {
      console.error("S3 upload error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown upload error",
      };
    }
  }

  private base64ToBlob(base64: string): Blob {
    // Remove data URL prefix if present
    const base64Data = base64.replace(/^data:image\/\w+;base64,/, "");
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);

    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: "image/png" });
  }

  private async getSystemInfo() {
    try {
      // Get OS info
      const os = navigator.platform.includes("Mac")
        ? "macOS"
        : navigator.platform.includes("Win")
        ? "Windows"
        : navigator.platform.includes("Linux")
        ? "Linux"
        : "Unknown";

      // Get IP address (this would need to be implemented with a service)
      const ipResponse = await fetch("https://api.ipify.org?format=json");
      const ipData = await ipResponse.json();
      const ip_address = ipData.ip || "Unknown";

      // Get geolocation (this would need to be implemented with a service)
      const geoResponse = await fetch(`https://ipapi.co/${ip_address}/json/`);
      const geoData = await geoResponse.json();
      const geo_location =
        geoData.city && geoData.region
          ? `${geoData.city}, ${geoData.region}`
          : "Unknown";

      return {
        os,
        ip_address,
        geo_location,
      };
    } catch (error) {
      console.error("Error getting system info:", error);
      return {
        os: "Unknown",
        ip_address: "Unknown",
        geo_location: "Unknown",
      };
    }
  }

  private async getActiveApplication(): Promise<string> {
    try {
      // This would need to be implemented in the main process
      // For now, return a placeholder
      return "Unknown Application";
    } catch (error) {
      console.error("Error getting active application:", error);
      return "Unknown Application";
    }
  }

  async uploadScreenshot(
    imageData: string,
    authData: {
      employee_id: string;
      organization_id: string;
      tracking_id: string;
      project_id?: string;
      task_id?: string;
    }
  ): Promise<S3UploadResponse> {
    try {
      // Generate filename with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, "_");
      const fileName = `screenshot_${timestamp}.png`;

      // Upload to S3
      const uploadResult = await this.uploadToS3(imageData, fileName);

      if (!uploadResult.success) {
        return uploadResult;
      }

      // Get system information
      const systemInfo = await this.getSystemInfo();
      const activeApp = await this.getActiveApplication();

      // Prepare data for backend
      const uploadData: any = {
        employee_id: authData.employee_id,
        organization_id: authData.organization_id,
        path: uploadResult.path || fileName,
        permission: true, // Assuming permission is granted if we're capturing
        os: systemInfo.os,
        geo_location: systemInfo.geo_location,
        ip_address: systemInfo.ip_address,
        app: activeApp,
        // tracking_id: authData.tracking_id,
        // project_id: authData.project_id,
        // task_id: authData.task_id,
      };

      // Send to backend using the API function
      const backendResult = await uploadScreenshotApi(uploadData);

      if (!backendResult.success) {
        throw new Error(backendResult.message || "Backend upload failed");
      }

      return {
        success: true,
        url: uploadResult.url,
        path: uploadResult.path,
      };
    } catch (error) {
      console.error("Screenshot upload error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown upload error",
      };
    }
  }
}

export const s3UploadService = new S3UploadService();
export default S3UploadService;
