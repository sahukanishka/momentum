import React, { useState, useEffect } from "react";

const PermissionDebugger: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  const checkAllPermissions = async () => {
    try {
      const screenPermission = await (
        window as any
      ).electronAPI.checkScreenRecordingPermission();
      const accessibilityPermission = await (
        window as any
      ).electronAPI.checkAccessibilityPermission();
      const screenSources = await (
        window as any
      ).electronAPI.getScreenSources();
      const systemInfo = await (window as any).electronAPI.getSystemInfo();

      setDebugInfo({
        timestamp: new Date().toISOString(),
        platform: systemInfo?.platform,
        screenRecordingPermission: screenPermission,
        accessibilityPermission: accessibilityPermission,
        screenSourcesCount: screenSources?.length || 0,
        screenSources:
          screenSources?.map((s: any) => ({ name: s.name, id: s.id })) || [],
        userAgent: navigator.userAgent,
        permissions: {
          notifications:
            "Notification" in window
              ? Notification.permission
              : "not supported",
          clipboard: navigator.clipboard ? "supported" : "not supported",
          geolocation:
            "geolocation" in navigator ? "supported" : "not supported",
        },
      });
    } catch (error) {
      console.error("Error checking permissions:", error);
      setDebugInfo({
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      });
    }
  };

  useEffect(() => {
    // Check permissions on mount
    checkAllPermissions();
  }, []);

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsVisible(true)}
          className="bg-gray-800 text-white px-3 py-2 rounded-lg text-xs hover:bg-gray-700 transition-colors"
        >
          🔧 Debug Permissions
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 max-w-2xl max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Permission Debugger
          </h3>
          <button
            onClick={() => setIsVisible(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex space-x-2">
            <button
              onClick={checkAllPermissions}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors"
            >
              Refresh Permissions
            </button>
            <button
              onClick={() =>
                (window as any).electronAPI.openSystemPreferences("screen")
              }
              className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-700 transition-colors"
            >
              Open Screen Recording Settings
            </button>
            <button
              onClick={() =>
                (window as any).electronAPI.openSystemPreferences(
                  "accessibility"
                )
              }
              className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 transition-colors"
            >
              Open Accessibility Settings
            </button>
          </div>

          {debugInfo && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-2">
                  System Information
                </h4>
                <div className="text-sm space-y-1">
                  <div>
                    <strong>Platform:</strong> {debugInfo.platform}
                  </div>
                  <div>
                    <strong>Timestamp:</strong> {debugInfo.timestamp}
                  </div>
                  <div>
                    <strong>User Agent:</strong> {debugInfo.userAgent}
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-2">
                  Permission Status
                </h4>
                <div className="text-sm space-y-1">
                  <div
                    className={`flex items-center space-x-2 ${
                      debugInfo.screenRecordingPermission
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    <span>
                      {debugInfo.screenRecordingPermission ? "✅" : "❌"}
                    </span>
                    <span>
                      <strong>Screen Recording:</strong>{" "}
                      {debugInfo.screenRecordingPermission
                        ? "Granted"
                        : "Not Granted"}
                    </span>
                  </div>
                  <div
                    className={`flex items-center space-x-2 ${
                      debugInfo.accessibilityPermission
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    <span>
                      {debugInfo.accessibilityPermission ? "✅" : "❌"}
                    </span>
                    <span>
                      <strong>Accessibility:</strong>{" "}
                      {debugInfo.accessibilityPermission
                        ? "Granted"
                        : "Not Granted"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-2">
                  Screen Sources
                </h4>
                <div className="text-sm">
                  <div>
                    <strong>Count:</strong> {debugInfo.screenSourcesCount}
                  </div>
                  {debugInfo.screenSources &&
                    debugInfo.screenSources.length > 0 && (
                      <div className="mt-2">
                        <strong>Available Sources:</strong>
                        <ul className="list-disc list-inside mt-1 space-y-1">
                          {debugInfo.screenSources.map(
                            (source: any, index: number) => (
                              <li key={index} className="text-xs">
                                {source.name} (ID: {source.id})
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    )}
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-2">
                  Browser Permissions
                </h4>
                <div className="text-sm space-y-1">
                  {Object.entries(debugInfo.permissions || {}).map(
                    ([key, value]) => (
                      <div key={key}>
                        <strong>{key}:</strong> {String(value)}
                      </div>
                    )
                  )}
                </div>
              </div>

              {debugInfo.error && (
                <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                  <h4 className="font-semibold text-red-800 mb-2">
                    Error Information
                  </h4>
                  <div className="text-sm text-red-700">
                    <div>
                      <strong>Error:</strong> {debugInfo.error}
                    </div>
                    {debugInfo.stack && (
                      <div className="mt-2">
                        <strong>Stack Trace:</strong>
                        <pre className="text-xs mt-1 bg-red-100 p-2 rounded overflow-x-auto">
                          {debugInfo.stack}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mt-6 text-xs text-gray-500">
          <p>
            <strong>Debugging Tips:</strong>
          </p>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>
              On macOS, ensure the app is added to Screen Recording in System
              Preferences
            </li>
            <li>
              For Accessibility, the app must be added to Accessibility in
              System Preferences
            </li>
            <li>Try restarting the app after granting permissions</li>
            <li>Check the console for detailed error messages</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PermissionDebugger;
