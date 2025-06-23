export interface ActivityData {
  timestamp: number;
  type: "screenshot" | "activity" | "idle" | "active";
  data: any;
  userId?: string;
  sessionId?: string;
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

class ActivityTracker {
  private isTracking = false;
  private screenshotInterval: NodeJS.Timeout | null = null;
  private activityInterval: NodeJS.Timeout | null = null;
  private lastActivity = Date.now();
  private sessionId = this.generateSessionId();
  private userId = this.getUserId();

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

  startTracking(): void {
    if (this.isTracking) return;

    this.isTracking = true;
    console.log("Starting activity tracking...");

    // Start screenshot capture every 30 seconds
    this.screenshotInterval = setInterval(() => {
      this.captureScreenshot();
    }, 30000); // 30 seconds

    // Start activity monitoring every 5 seconds
    this.activityInterval = setInterval(() => {
      this.trackActivity();
    }, 5000); // 5 seconds

    // Initial capture
    this.captureScreenshot();
    this.trackActivity();
  }

  stopTracking(): void {
    if (!this.isTracking) return;

    this.isTracking = false;
    console.log("Stopping activity tracking...");

    if (this.screenshotInterval) {
      clearInterval(this.screenshotInterval);
      this.screenshotInterval = null;
    }

    if (this.activityInterval) {
      clearInterval(this.activityInterval);
      this.activityInterval = null;
    }
  }

  private async captureScreenshot(): Promise<void> {
    try {
      const screenshotData = await (
        window as any
      ).electronAPI.captureScreenshot();

      if (screenshotData) {
        const activityData: ActivityData = {
          timestamp: Date.now(),
          type: "screenshot",
          data: screenshotData,
          userId: this.userId,
          sessionId: this.sessionId,
        };

        await this.sendToBackend(activityData);
      }
    } catch (error) {
      console.error("Screenshot capture failed:", error);
    }
  }

  private async trackActivity(): Promise<void> {
    try {
      const activityData = await (window as any).electronAPI.getActivityData();

      if (activityData) {
        const activity: ActivityData = {
          timestamp: Date.now(),
          type: "activity",
          data: activityData,
          userId: this.userId,
          sessionId: this.sessionId,
        };

        await this.sendToBackend(activity);
      }
    } catch (error) {
      console.error("Activity tracking failed:", error);
    }
  }

  private async sendToBackend(data: ActivityData): Promise<void> {
    try {
      // In a real app, this would send to your backend API
      console.log("Sending data to backend:", {
        type: data.type,
        timestamp: new Date(data.timestamp).toISOString(),
        userId: data.userId,
        sessionId: data.sessionId,
      });

      // Example API call (replace with your actual backend endpoint)
      // await fetch('https://your-backend.com/api/activity', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(data)
      // })
    } catch (error) {
      console.error("Failed to send data to backend:", error);
    }
  }

  getTrackingStatus(): boolean {
    return this.isTracking;
  }

  getSessionInfo() {
    return {
      sessionId: this.sessionId,
      userId: this.userId,
      isTracking: this.isTracking,
    };
  }
}

export const activityTracker = new ActivityTracker();
