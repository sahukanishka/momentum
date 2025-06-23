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
          className="flex-1 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl flex items-center justify-center space-x-3"
        >
          <span className="text-lg">▶️</span>
          <span>Start Timer</span>
        </button>
      ) : (
        <button
          onClick={onStop}
          className="flex-1 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl flex items-center justify-center space-x-3"
        >
          <span className="text-lg">⏹️</span>
          <span>Stop Timer</span>
        </button>
      )}
    </div>
  );
};

export default TimerControls;
