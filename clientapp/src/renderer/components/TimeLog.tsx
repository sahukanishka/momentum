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
        <div className="text-gray-400 text-6xl mb-4">📊</div>
        <p className="text-gray-500">No time entries yet</p>
        <p className="text-gray-400 text-sm">
          Start tracking to see your history
        </p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Recent Time Entries
      </h3>
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {timeEntries.map((entry) => (
          <div key={entry.id} className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
              <span className="font-medium text-gray-800">{entry.project}</span>
              <span className="text-sm font-mono text-blue-600">
                {entry.duration ? formatTime(entry.duration) : "N/A"}
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-2">{entry.description}</p>
            <div className="text-xs text-gray-400">
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
