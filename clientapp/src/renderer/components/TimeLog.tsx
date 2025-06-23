import React from "react";

interface TimeEntry {
  id: string;
  project: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  description: string;
}

interface TimeLogProps {
  timeEntries: TimeEntry[];
  formatTime: (seconds: number) => string;
}

const TimeLog: React.FC<TimeLogProps> = ({ timeEntries, formatTime }) => {
  if (timeEntries.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-6xl mb-4 text-gray-300">📊</div>
        <p className="text-gray-500 font-medium">No time entries yet</p>
        <p className="text-gray-400 text-sm mt-1">
          Start tracking to see your history
        </p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
        <span className="w-2 h-2 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full mr-3"></span>
        Recent Time Entries
      </h3>
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {timeEntries.map((entry) => (
          <div
            key={entry.id}
            className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-4 border border-purple-100 hover:shadow-md transition-all duration-200"
          >
            <div className="flex justify-between items-start mb-2">
              <span className="font-medium text-gray-800">{entry.project}</span>
              <span className="text-sm font-mono bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent font-semibold">
                {entry.duration ? formatTime(entry.duration) : "N/A"}
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-2">{entry.description}</p>
            <div className="text-xs text-gray-400 flex items-center">
              <span className="w-1 h-1 bg-purple-400 rounded-full mr-2"></span>
              {entry.startTime.toLocaleTimeString()} -{" "}
              {entry.endTime?.toLocaleTimeString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TimeLog;
