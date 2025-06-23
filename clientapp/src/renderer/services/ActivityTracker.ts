import { s3UploadService } from "./S3UploadService";

export interface ActivityData {
  timestamp: number;
  type: "screenshot" | "activity" | "idle" | "active";
  data: any;
  userId?: string;
  sessionId?: string;
  organizationId?: string;
  employeeId?: string;
  trackingId?: string;
}

export interface ScreenshotData {
  timestamp: number;
  imageData: string; // base64 encoded
  windowTitle?: string;
  applicationName?: string;
}

export interface UserActivity {
  timestamp: number;
  mousePosition?: { x: number; y: number };
  keyboardActivity?: boolean;
  applicationName?: string;
  windowTitle?: string;
  idleTime?: number;
}

interface TrackingConfig {
  userId?: string;
  organizationId?: string;
  employeeId?: string;
  trackingId?: string;
  projectId?: string;
  taskId?: string;
}

class ActivityTracker {
  private isTracking = false;
  private screenshotInterval: NodeJS.Timeout | null = null;
  private lastActivity = Date.now();
  private sessionId = this.generateSessionId();
  private userId = this.getUserId();
  private organizationId: string | null = null;
  private employeeId: string | null = null;
  private trackingId: string | null = null;
  private projectId: string | null = null;
  private taskId: string | null = null;

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getUserId(): string {
    // In a real app, this would come from user authentication
    return `user_${Math.random().toString(36).substr(2, 9)}`;
  }

  async requestPermissions(): Promise<boolean> {
    try {
      // Request screen capture permission
      const hasScreenPermission = await this.requestScreenPermission();
      if (!hasScreenPermission) {
        console.error("Screen capture permission denied");
        return false;
      }

      // Request accessibility permission (for activity tracking)
      const hasAccessibilityPermission =
        await this.requestAccessibilityPermission();
      if (!hasAccessibilityPermission) {
        console.error("Accessibility permission denied");
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error requesting permissions:", error);
      return false;
    }
  }

  private async requestScreenPermission(): Promise<boolean> {
    try {
      // This will trigger the system permission dialog
      const sources = await (window as any).electronAPI.getScreenSources();
      return sources && sources.length > 0;
    } catch (error) {
      console.error("Screen permission request failed:", error);
      return false;
    }
  }

  private async requestAccessibilityPermission(): Promise<boolean> {
    try {
      // Check if accessibility permission is granted
      const hasPermission = await (
        window as any
      ).electronAPI.checkAccessibilityPermission();
      return hasPermission;
    } catch (error) {
      console.error("Accessibility permission check failed:", error);
      return false;
    }
  }

  startTracking(config?: TrackingConfig): void {
    if (this.isTracking) return;

    // Update tracking configuration if provided
    if (config) {
      if (config.userId) this.userId = config.userId;
      if (config.organizationId) this.organizationId = config.organizationId;
      if (config.employeeId) this.employeeId = config.employeeId;
      if (config.trackingId) this.trackingId = config.trackingId;
      if (config.projectId) this.projectId = config.projectId;
      if (config.taskId) this.taskId = config.taskId;
    }

    this.isTracking = true;
    console.log("Starting activity tracking (screenshots only)...", {
      userId: this.userId,
      organizationId: this.organizationId,
      employeeId: this.employeeId,
      trackingId: this.trackingId,
      projectId: this.projectId,
      taskId: this.taskId,
    });

    // Start screenshot capture with activity data every 30 seconds
    this.screenshotInterval = setInterval(() => {
      this.captureScreenshotWithActivity();
    }, 30000); // 30 seconds

    // Initial capture
    this.captureScreenshotWithActivity();
  }

  stopTracking(): void {
    if (!this.isTracking) return;

    this.isTracking = false;
    console.log("Stopping activity tracking...");

    if (this.screenshotInterval) {
      clearInterval(this.screenshotInterval);
      this.screenshotInterval = null;
    }
  }

  private async captureScreenshot(): Promise<void> {
    try {
      const screenshotData = await (
        window as any
      ).electronAPI.captureScreenshot();

      if (screenshotData && screenshotData.imageData) {
        // Upload to S3 and send to backend
        await this.uploadScreenshotToS3(screenshotData.imageData);

        const activityData: ActivityData = {
          timestamp: Date.now(),
          type: "screenshot",
          data: screenshotData,
          userId: this.userId,
          sessionId: this.sessionId,
          organizationId: this.organizationId || undefined,
          employeeId: this.employeeId || undefined,
          trackingId: this.trackingId || undefined,
        };

        await this.sendToBackend(activityData);
      }
    } catch (error) {
      console.error("Screenshot capture failed:", error);
    }
  }

  private async captureScreenshotWithActivity(): Promise<void> {
    try {
      // Get activity data from main process
      const activityData = await (window as any).electronAPI.getActivityData();

      // Capture screenshot
      const screenshotData = await (
        window as any
      ).electronAPI.captureScreenshot();

      if (screenshotData && screenshotData.imageData) {
        // Combine screenshot with activity data
        const combinedData = {
          ...screenshotData,
          activity: activityData,
        };

        // Upload to S3 and send to backend
        await this.uploadScreenshotToS3(screenshotData.imageData);

        // Send combined data to backend
        const activityDataForBackend: ActivityData = {
          timestamp: Date.now(),
          type: "screenshot",
          data: combinedData,
          userId: this.userId,
          sessionId: this.sessionId,
          organizationId: this.organizationId || undefined,
          employeeId: this.employeeId || undefined,
          trackingId: this.trackingId || undefined,
        };

        await this.sendToBackend(activityDataForBackend);

        // Also send activity data separately to activity logging endpoint
        if (activityData) {
          await this.sendActivityDataToBackend(activityData);
        }

        console.log("Screenshot with activity data captured and sent:", {
          timestamp: new Date().toISOString(),
          hasActivityData: !!activityData,
          hasScreenshot: !!screenshotData.imageData,
          userId: this.userId,
          organizationId: this.organizationId,
          employeeId: this.employeeId,
          trackingId: this.trackingId,
        });
      }
    } catch (error) {
      console.error("Screenshot with activity capture failed:", error);
    }
  }

  private async uploadScreenshotToS3(imageData: string): Promise<void> {
    try {
      // Check if we have the required data for upload
      if (!this.employeeId || !this.organizationId || !this.trackingId) {
        console.warn("Missing required data for S3 upload:", {
          employeeId: this.employeeId,
          organizationId: this.organizationId,
          trackingId: this.trackingId,
        });
        return;
      }

      const uploadResult = await s3UploadService.uploadScreenshot(imageData, {
        employee_id: this.employeeId,
        organization_id: this.organizationId,
        tracking_id: this.trackingId,
        project_id: this.projectId || undefined,
        task_id: this.taskId || undefined,
      });

      if (uploadResult.success) {
        console.log("Screenshot uploaded successfully:", {
          url: uploadResult.url,
          path: uploadResult.path,
        });
      } else {
        console.error("Screenshot upload failed:", uploadResult.error);
      }
    } catch (error) {
      console.error("Error uploading screenshot to S3:", error);
    }
  }

  private async sendToBackend(data: ActivityData): Promise<void> {
    try {
      console.log("🔄 Sending data to backend:", {
        type: data.type,
        timestamp: new Date(data.timestamp).toISOString(),
        userId: data.userId,
        sessionId: data.sessionId,
        organizationId: data.organizationId,
        employeeId: data.employeeId,
        trackingId: data.trackingId,
      });

      // Get auth token from localStorage
      const tokens = localStorage.getItem("momentum_tokens");
      const accessToken = tokens ? JSON.parse(tokens).access_token : null;

      if (!accessToken) {
        console.error("❌ No access token found for API calls");
        return;
      }

      console.log(
        "🔑 Using access token:",
        accessToken.substring(0, 20) + "..."
      );

      // Send activity data to backend API
      const requestBody = {
        type: data.type,
        timestamp: data.timestamp,
        data: data.data,
        user_id: data.userId,
        session_id: data.sessionId,
        organization_id: data.organizationId,
        employee_id: data.employeeId,
        tracking_id: data.trackingId,
      };

      console.log("📤 Sending request to backend:", {
        url: "http://127.0.0.1:8000/api/v1/activity/track",
        method: "POST",
        body: requestBody,
      });

      const response = await fetch(
        "http://127.0.0.1:8000/api/v1/activity/track",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(requestBody),
        }
      );

      console.log("📥 Backend response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `API call failed: ${response.statusText}`
        );
      }

      const responseData = await response.json();

      if (responseData.success) {
        console.log("✅ Activity data sent successfully to backend");
      } else {
        console.error("❌ Backend returned error:", responseData.message);
      }
    } catch (error) {
      console.error("❌ Failed to send data to backend:", error);
    }
  }

  private async sendActivityDataToBackend(activityData: any): Promise<void> {
    try {
      console.log("🔄 Sending activity data to backend:", {
        timestamp: new Date().toISOString(),
        hasActivityData: !!activityData,
        userId: this.userId,
        organizationId: this.organizationId,
        employeeId: this.employeeId,
        trackingId: this.trackingId,
      });

      // Get auth token from localStorage
      const tokens = localStorage.getItem("momentum_tokens");
      const accessToken = tokens ? JSON.parse(tokens).access_token : null;

      if (!accessToken) {
        console.error("❌ No access token found for activity API calls");
        return;
      }

      console.log(
        "🔑 Using access token for activity API:",
        accessToken.substring(0, 20) + "..."
      );

      // Send activity data to backend API
      const requestBody = {
        timestamp: Date.now(),
        activity_data: activityData,
        user_id: this.userId,
        session_id: this.sessionId,
        organization_id: this.organizationId,
        employee_id: this.employeeId,
        tracking_id: this.trackingId,
        project_id: this.projectId,
        task_id: this.taskId,
      };

      console.log("📤 Sending activity request to backend:", {
        url: "http://127.0.0.1:8000/api/v1/activity/log",
        method: "POST",
        body: requestBody,
      });

      const response = await fetch(
        "http://127.0.0.1:8000/api/v1/activity/log",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(requestBody),
        }
      );

      console.log("📥 Activity backend response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
            `Activity API call failed: ${response.statusText}`
        );
      }

      const responseData = await response.json();

      if (responseData.success) {
        console.log("✅ Activity data logged successfully to backend");
      } else {
        console.error("❌ Backend returned error:", responseData.message);
      }
    } catch (error) {
      console.error("❌ Failed to send activity data to backend:", error);
    }
  }

  getTrackingStatus(): boolean {
    return this.isTracking;
  }

  getSessionInfo() {
    return {
      sessionId: this.sessionId,
      userId: this.userId,
      organizationId: this.organizationId,
      employeeId: this.employeeId,
      trackingId: this.trackingId,
      projectId: this.projectId,
      taskId: this.taskId,
      isTracking: this.isTracking,
    };
  }

  async clockIn(trackingId: string, notes: string): Promise<void> {
    try {
      const tokens = localStorage.getItem("momentum_tokens");
      const accessToken = tokens ? JSON.parse(tokens).access_token : null;
      if (!accessToken) {
        throw new Error("No access token found");
      }
      const response = await fetch(
        `http://127.0.0.1:8000/api/v1/time-tracking/clock-in/${trackingId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ notes }),
        }
      );
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Clock-in failed: ${response.statusText}`
        );
      }
      const data = await response.json();
      if (data.success) {
        console.log("✅ Clock-in successful");
      } else {
        console.error("❌ Clock-in error:", data.message);
      }
    } catch (error) {
      console.error("❌ Clock-in API error:", error);
    }
  }

  async clockOut(employeeId: any, notes: string): Promise<void> {
    try {
      const tokens = localStorage.getItem("momentum_tokens");
      const accessToken = tokens ? JSON.parse(tokens).access_token : null;
      if (!accessToken) {
        throw new Error("No access token found");
      }
      const response = await fetch(
        `http://127.0.0.1:8000/api/v1/time-tracking/clock-out/${employeeId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ notes }),
        }
      );
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Clock-out failed: ${response.statusText}`
        );
      }
      const data = await response.json();
      if (data.success) {
        console.log("✅ Clock-out successful");
      } else {
        console.error("❌ Clock-out error:", data.message);
      }
    } catch (error) {
      console.error("❌ Clock-out API error:", error);
    }
  }
}

export const activityTracker = new ActivityTracker();
