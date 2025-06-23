import React, { useState, useEffect } from "react";
import TimeDisplay from "./components/TimeDisplay";
import TimerControls from "./components/TimerControls";
import ProjectSelector from "./components/ProjectSelector";
import TimeLog from "./components/TimeLog";

interface TimeEntry {
  id: string;
  project: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  description: string;
}

function App() {
  const [isTracking, setIsTracking] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [selectedProject, setSelectedProject] = useState("General");
  const [description, setDescription] = useState("");
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [startTime, setStartTime] = useState<Date | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isTracking) {
      interval = setInterval(() => {
        setCurrentTime((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isTracking]);

  const handleStartTracking = () => {
    setIsTracking(true);
    setStartTime(new Date());
    setCurrentTime(0);
  };

  const handleStopTracking = () => {
    if (startTime) {
      const endTime = new Date();
      const duration = Math.floor(
        (endTime.getTime() - startTime.getTime()) / 1000
      );

      const newEntry: TimeEntry = {
        id: Date.now().toString(),
        project: selectedProject,
        startTime,
        endTime,
        duration,
        description: description || "No description",
      };

      setTimeEntries((prev) => [newEntry, ...prev]);
    }

    setIsTracking(false);
    setStartTime(null);
    setCurrentTime(0);
    setDescription("");
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4">
          <h1 className="text-white text-xl font-semibold text-center">
            Momentum Time Tracker
          </h1>
          <p className="text-blue-100 text-sm text-center mt-1">
            Track your time like a pro
          </p>
        </div>

        {/* Main Content */}
        <div className="p-6 space-y-6">
          {/* Time Display */}
          <TimeDisplay
            currentTime={currentTime}
            formatTime={formatTime}
            isTracking={isTracking}
          />

          {/* Project Selector */}
          <ProjectSelector
            selectedProject={selectedProject}
            onProjectChange={setSelectedProject}
          />

          {/* Description Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What are you working on?
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter task description..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={3}
            />
          </div>

          {/* Timer Controls */}
          <TimerControls
            isTracking={isTracking}
            onStart={handleStartTracking}
            onStop={handleStopTracking}
          />

          {/* Time Log */}
          <TimeLog timeEntries={timeEntries} formatTime={formatTime} />
        </div>
      </div>
    </div>
  );
}

export default App;
