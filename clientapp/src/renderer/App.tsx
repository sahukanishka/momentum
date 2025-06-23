import React, { useState, useEffect } from "react";
import TimeDisplay from "./components/TimeDisplay";
import TimerControls from "./components/TimerControls";
import ProjectSelector from "./components/ProjectSelector";
import TimeLog from "./components/TimeLog";
import ActivityControls from "./components/ActivityControls";
import WelcomeScreen from "./components/WelcomeScreen";
import LoginScreen from "./components/LoginScreen";

interface TimeEntry {
  id: string;
  project: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  description: string;
}

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<
    "welcome" | "login" | "home"
  >("welcome");
  const [user, setUser] = useState<any>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [isTracking, setIsTracking] = useState(false);
  const [selectedProject, setSelectedProject] = useState("General");
  const [description, setDescription] = useState("");
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [startTime, setStartTime] = useState<Date | null>(null);

  useEffect(() => {
    // Check if user is already logged in
    const savedUser = localStorage.getItem("momentum_user");
    const accessToken = localStorage.getItem("momentum_access_token");

    if (savedUser && accessToken) {
      setUser(JSON.parse(savedUser));
      setCurrentScreen("home");
    }
  }, []);

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

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleStartTimer = () => {
    setIsTracking(true);
    setStartTime(new Date());
  };

  const handleStopTimer = () => {
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

      setTimeEntries((prev) => [newEntry, ...prev.slice(0, 9)]); // Keep only last 10 entries
      setDescription("");
    }

    setIsTracking(false);
    setCurrentTime(0);
    setStartTime(null);
  };

  const handleLoginSuccess = (
    userData: any,
    tokens: { access_token: string; refresh_token: string }
  ) => {
    setUser(userData);
    setCurrentScreen("home");
  };

  const handleLogout = () => {
    localStorage.removeItem("momentum_user");
    localStorage.removeItem("momentum_access_token");
    localStorage.removeItem("momentum_refresh_token");
    setUser(null);
    setCurrentScreen("welcome");
  };

  if (currentScreen === "welcome") {
    return <WelcomeScreen onContinue={() => setCurrentScreen("login")} />;
  }

  if (currentScreen === "login") {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className=" rounded-2xl p-6 mb-6 border border-white/20">
          <div className="flex justify-center items-center">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Momentum
              </h1>
              <p className="text-gray-600 text-sm">
                Hey 👋 {user?.name || user?.email || "User"}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Timer Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Timer Display */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20">
              <TimeDisplay
                currentTime={currentTime}
                formatTime={formatTime}
                isTracking={isTracking}
              />
              {/* Timer Controls */}
              <div className=" items-center pt-4">
                <TimerControls
                  isTracking={isTracking}
                  onStart={handleStartTimer}
                  onStop={handleStopTimer}
                />
              </div>
            </div>

            {/* Project and Description */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20 space-y-6">
              <ProjectSelector
                selectedProject={selectedProject}
                onProjectChange={setSelectedProject}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What are you working on?"
                  className="w-full text-black px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm resize-none"
                  rows={3}
                />
              </div>
            </div>

            {/* Time Log */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
              <TimeLog timeEntries={timeEntries} formatTime={formatTime} />
            </div>
          </div>

          {/* Activity Controls Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
              <ActivityControls />
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-medium py-2 px-4 rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;
