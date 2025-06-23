import React, { useState, useEffect } from "react";

interface UploadLog {
  id: string;
  timestamp: Date;
  status: "success" | "error" | "pending";
  message: string;
  url?: string;
  path?: string;
}

const UploadStatus: React.FC = () => {
  const [uploadLogs, setUploadLogs] = useState<UploadLog[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const handleUploadEvent = (event: any) => {
      const { type, data } = event;

      if (type === "screenshot-upload") {
        const log: UploadLog = {
          id: Date.now().toString(),
          timestamp: new Date(),
          status: data.success ? "success" : "error",
          message: data.success
            ? "Screenshot uploaded successfully"
            : data.error || "Upload failed",
          url: data.url,
          path: data.path,
        };

        setUploadLogs((prev) => [log, ...prev.slice(0, 9)]);
      }
    };

    window.addEventListener("upload-event", handleUploadEvent);

    return () => {
      window.removeEventListener("upload-event", handleUploadEvent);
    };
  }, []);

  const getStatusColor = (status: UploadLog["status"]) => {
    switch (status) {
      case "success":
        return "text-green-600 bg-green-50 border-green-200";
      case "error":
        return "text-red-600 bg-red-50 border-red-200";
      case "pending":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getStatusIcon = (status: UploadLog["status"]) => {
    switch (status) {
      case "success":
        return "✅";
      case "error":
        return "❌";
      case "pending":
        return "⏳";
      default:
        return "ℹ️";
    }
  };

  if (uploadLogs.length === 0) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <span className="w-2 h-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mr-3"></span>
          Screenshot Upload Status
        </h3>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-sm text-blue-600 hover:text-blue-800 transition-colors duration-200"
        >
          {isExpanded ? "Hide Details" : "Show Details"}
        </button>
      </div>

      <div className="space-y-3">
        {uploadLogs.slice(0, isExpanded ? uploadLogs.length : 3).map((log) => (
          <div
            key={log.id}
            className={`p-3 rounded-lg border ${getStatusColor(log.status)}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-sm">{getStatusIcon(log.status)}</span>
                <span className="text-sm font-medium">{log.message}</span>
              </div>
              <span className="text-xs text-gray-500">
                {log.timestamp.toLocaleTimeString()}
              </span>
            </div>

            {isExpanded && log.path && (
              <div className="mt-2 text-xs text-gray-600">
                <div className="font-medium">Path:</div>
                <div className="font-mono bg-white/50 px-2 py-1 rounded mt-1">
                  {log.path}
                </div>
              </div>
            )}

            {isExpanded && log.url && (
              <div className="mt-2 text-xs text-gray-600">
                <div className="font-medium">URL:</div>
                <div className="font-mono bg-white/50 px-2 py-1 rounded mt-1 break-all">
                  {log.url}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {uploadLogs.length > 3 && !isExpanded && (
        <div className="mt-3 text-center">
          <button
            onClick={() => setIsExpanded(true)}
            className="text-sm text-blue-600 hover:text-blue-800 transition-colors duration-200"
          >
            Show {uploadLogs.length - 3} more logs
          </button>
        </div>
      )}

      <div className="mt-4 text-xs text-gray-500 text-center">
        Screenshots are automatically uploaded to S3 every 30 seconds
      </div>
    </div>
  );
};

export default UploadStatus;
