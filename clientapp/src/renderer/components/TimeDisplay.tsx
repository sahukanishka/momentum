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
        className={`text-4xl font-mono font-bold ${
          isTracking ? "text-green-600" : "text-gray-400"
        }`}
      >
        {formatTime(currentTime)}
      </div>
      <div
        className={`text-sm mt-2 ${
          isTracking ? "text-green-600" : "text-gray-500"
        }`}
      >
        {isTracking ? "⏱️ Tracking time..." : "⏸️ Timer stopped"}
      </div>
    </div>
  );
};

export default TimeDisplay;
