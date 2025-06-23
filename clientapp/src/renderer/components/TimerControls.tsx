import React from "react";

interface TimerControlsProps {
  isTracking: boolean;
  onStart: () => void;
  onStop: () => void;
}

const TimerControls: React.FC<TimerControlsProps> = ({
  isTracking,
  onStart,
  onStop,
}) => {
  return (
    <div className="flex space-x-4">
      {!isTracking ? (
        <button
          onClick={onStart}
          className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
        >
          <span>▶️</span>
          <span>Start Timer</span>
        </button>
      ) : (
        <button
          onClick={onStop}
          className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
        >
          <span>⏹️</span>
          <span>Stop Timer</span>
        </button>
      )}
    </div>
  );
};

export default TimerControls;
