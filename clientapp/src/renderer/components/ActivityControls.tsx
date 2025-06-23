import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { activityTracker } from "../services/ActivityTracker";

const ActivityControls: React.FC = () => {
  const {
    user,
    organizationId,
    employeeId,
    projectId,
    taskId,
    setTrackingData,
  } = useAuth();
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const [isTracking, setIsTracking] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState({
    screen: false,
    accessibility: false,
  });

  useEffect(() => {
    checkPermissions();
    checkTrackingStatus();
  }, []);

  const checkPermissions = async () => {
    try {
      // Check screen recording permission using the new method
      const screenPermission = await (
        window as any
      ).electronAPI.checkScreenRecordingPermission();
      const accessibilityPermission = await (
        window as any
      ).electronAPI.checkAccessibilityPermission();

      console.log("Permission check results:", {
        screen: screenPermission,
        accessibility: accessibilityPermission,
      });

      setPermissionStatus({
        screen: screenPermission,
        accessibility: accessibilityPermission,
      });

      setPermissionsGranted(screenPermission && accessibilityPermission);
    } catch (error) {
      console.error("Error checking permissions:", error);
      setPermissionStatus({
        screen: false,
        accessibility: false,
      });
      setPermissionsGranted(false);
    }
  };

  const checkTrackingStatus = async () => {
    try {
      const status = await (window as any).electronAPI.getTrackingStatus();
      setIsTracking(status);
    } catch (error) {
      console.error("Error checking tracking status:", error);
    }
  };

  const openSystemPreferences = async (
    permissionType: "screen" | "accessibility"
  ) => {
    try {
      await (window as any).electronAPI.openSystemPreferences(permissionType);
    } catch (error) {
      console.error("Error opening system preferences:", error);
      // Fallback: show manual instructions
      showManualInstructions(permissionType);
    }
  };

  const showManualInstructions = (
    permissionType: "screen" | "accessibility"
  ) => {
    const instructions =
      permissionType === "screen"
        ? `To grant Screen Recording permission:
1. Open System Preferences
2. Go to Security & Privacy > Privacy
3. Select "Screen Recording" from the left sidebar
4. Click the lock icon to make changes
5. Add this app to the list and check the box`
        : `To grant Accessibility permission:
1. Open System Preferences
2. Go to Security & Privacy > Privacy
3. Select "Accessibility" from the left sidebar
4. Click the lock icon to make changes
5. Add this app to the list and check the box`;

    alert(instructions);
  };

  const requestPermissions = async () => {
    try {
      const granted = await activityTracker.requestPermissions();
      if (granted) {
        setPermissionsGranted(true);
        await checkPermissions();
      } else {
        // Show which specific permissions are missing
        const missingPermissions = [];
        if (!permissionStatus.screen)
          missingPermissions.push("Screen Recording");
        if (!permissionStatus.accessibility)
          missingPermissions.push("Accessibility");

        const message = `The following permissions are required:\n${missingPermissions.join(
          "\n"
        )}\n\nPlease grant these permissions in System Preferences.`;
        alert(message);
      }
    } catch (error) {
      console.error("Error requesting permissions:", error);
      alert(
        "Failed to request permissions. Please check your system settings."
      );
    }
  };

  const startTracking = async () => {
    if (!permissionsGranted) {
      alert("Please grant all required permissions first.");
      return;
    }

    try {
      // Generate a unique tracking ID
      const trackingId = `tracking_${user?.id}_${Date.now()}`;

      // Set tracking data in context
      setTrackingData({ trackingId });

      // Start tracking with user and organization context
      await activityTracker.startTracking({
        userId: user?.id,
        organizationId: organizationId || undefined,
        employeeId: employeeId || undefined,
        trackingId,
        projectId: projectId || undefined,
        taskId: taskId || undefined,
      });

      setIsTracking(true);
    } catch (error) {
      console.error("Error starting tracking:", error);
      alert("Failed to start activity tracking.");
    }
  };

  const stopTracking = async () => {
    try {
      await activityTracker.stopTracking();
      setIsTracking(false);
    } catch (error) {
      console.error("Error stopping tracking:", error);
      alert("Failed to stop activity tracking.");
    }
  };

  const getSessionInfo = () => {
    const sessionInfo = activityTracker.getSessionInfo();
    return {
      ...sessionInfo,
      userId: user?.id || "Unknown",
      organizationId: organizationId || "Not set",
      employeeId: employeeId || "Not set",
      projectId: projectId || "Not set",
      taskId: taskId || "Not set",
    };
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <span className="w-2 h-2 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full mr-3"></span>
          Activity Tracking Permissions
        </h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Screen Recording</span>
            <div className="flex items-center space-x-3">
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  permissionStatus.screen
                    ? "bg-green-100 text-green-700 border border-green-200"
                    : "bg-red-100 text-red-700 border border-red-200"
                }`}
              >
                {permissionStatus.screen ? "✓ Granted" : "✗ Required"}
              </span>
              {!permissionStatus.screen && (
                <button
                  onClick={() => openSystemPreferences("screen")}
                  className="text-xs text-purple-600 hover:text-purple-800 underline transition-colors duration-200"
                >
                  Open Settings
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Accessibility</span>
            <div className="flex items-center space-x-3">
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  permissionStatus.accessibility
                    ? "bg-green-100 text-green-700 border border-green-200"
                    : "bg-red-100 text-red-700 border border-red-200"
                }`}
              >
                {permissionStatus.accessibility ? "✓ Granted" : "✗ Required"}
              </span>
              {!permissionStatus.accessibility && (
                <button
                  onClick={() => openSystemPreferences("accessibility")}
                  className="text-xs text-purple-600 hover:text-purple-800 underline transition-colors duration-200"
                >
                  Open Settings
                </button>
              )}
            </div>
          </div>
        </div>

        {!permissionsGranted && (
          <div className="mt-6 space-y-3">
            <button
              onClick={requestPermissions}
              className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-medium py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
            >
              Request Permissions
            </button>
            <button
              onClick={() => openSystemPreferences("screen")}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
            >
              Open System Preferences
            </button>
          </div>
        )}
      </div>

      <div className="bg-gradient-to-r from-gray-50 to-slate-50 border border-gray-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <span className="w-2 h-2 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full mr-3"></span>
          Activity Tracking
        </h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Tracking Status</span>
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                isTracking
                  ? "bg-green-100 text-green-700 border border-green-200"
                  : "bg-gray-100 text-gray-600 border border-gray-200"
              }`}
            >
              {isTracking ? "🟢 Active" : "⚪ Inactive"}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">User ID</span>
            <span className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded">
              {user?.id ? `${user.id.substring(0, 8)}...` : "Not set"}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Organization ID</span>
            <span className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded">
              {organizationId
                ? `${organizationId.substring(0, 8)}...`
                : "Not set"}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Employee ID</span>
            <span className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded">
              {employeeId ? `${employeeId.substring(0, 8)}...` : "Not set"}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Project ID</span>
            <span className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded">
              {projectId ? `${projectId.substring(0, 8)}...` : "Not set"}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Task ID</span>
            <span className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded">
              {taskId ? `${taskId.substring(0, 8)}...` : "Not set"}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Session ID</span>
            <span className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded">
              {getSessionInfo().sessionId.substring(0, 8)}...
            </span>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          {!isTracking ? (
            <button
              onClick={startTracking}
              disabled={!permissionsGranted}
              className={`w-full font-medium py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl ${
                permissionsGranted
                  ? "bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              Start Activity Tracking
            </button>
          ) : (
            <button
              onClick={stopTracking}
              className="w-full bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white font-medium py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
            >
              Stop Activity Tracking
            </button>
          )}
        </div>
      </div>

      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-yellow-800 mb-3 flex items-center">
          <span className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></span>
          Important Notice
        </h3>
        <p className="text-sm text-yellow-700 leading-relaxed">
          This app tracks your activity for remote work monitoring purposes.
          Screenshots with activity details are captured every 30 seconds and
          sent to your employer's monitoring system.
        </p>
      </div>
    </div>
  );
};

export default ActivityControls;
