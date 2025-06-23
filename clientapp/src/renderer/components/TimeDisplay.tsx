import React from "react";

interface TimeDisplayProps {
  currentTime: number;
  formatTime: (seconds: number) => string;
  isTracking: boolean;
}

const TimeDisplay: React.FC<TimeDisplayProps> = ({
  currentTime,
  formatTime,
  isTracking,
}) => {
  return (
    <div className="text-center">
      <div
        className={`text-5xl font-mono font-bold mb-3 ${
          isTracking
            ? "bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent"
            : "text-gray-400"
        }`}
      >
        {formatTime(currentTime)}
      </div>
      <div
        className={`text-sm font-medium px-4 py-2 rounded-xl inline-block ${
          isTracking
            ? "bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-700 border border-purple-200"
            : "bg-gray-100 text-gray-500"
        }`}
      >
        {isTracking ? "⏱️ Tracking time..." : "⏸️ Timer stopped"}
      </div>
    </div>
  );
};

export default TimeDisplay;
