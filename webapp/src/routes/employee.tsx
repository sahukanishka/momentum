import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Sidebar } from "@/components/Sidebar";
import { Dashboard } from "@/components/Dashboard";
import { useAuth } from "@/context/auth-context";
import { logoutUser } from "@/api/endpoints/auth";
import { toast } from "sonner";

// Placeholder components for missing pages
const PlaceholderPage = ({
  title,
  description,
}: {
  title: string;
  description: string;
}) => (
  <div className="p-6">
    <h1 className="text-3xl font-bold text-foreground mb-4">{title}</h1>
    <div className="bg-card border border-border rounded-xl p-8 text-center">
      <p className="text-muted-foreground">{description}</p>
    </div>
  </div>
);

export function EmployeeRoutes() {
  const { dispatch } = useAuth();

  const handleLogout = async () => {
    try {
      await logoutUser();
      dispatch({ type: "LOGOUT" });
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Logout error:", error);
      dispatch({ type: "LOGOUT" });
      toast.success("Logged out successfully");
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar userRole="employee" onLogout={handleLogout} />
      <main className="flex-1 overflow-auto">
        <Routes>
          <Route
            path="/"
            element={<Navigate to="/employee/dashboard" replace />}
          />
          <Route
            path="/dashboard"
            element={<Dashboard userRole="employee" />}
          />
          <Route
            path="/time-tracking"
            element={
              <PlaceholderPage
                title="Time Tracking"
                description="Time tracking functionality coming soon..."
              />
            }
          />
          <Route
            path="/projects"
            element={
              <PlaceholderPage
                title="My Projects"
                description="Project management coming soon..."
              />
            }
          />
          <Route
            path="/tasks"
            element={
              <PlaceholderPage
                title="My Tasks"
                description="Task management coming soon..."
              />
            }
          />
          <Route
            path="/profile"
            element={
              <PlaceholderPage
                title="Profile"
                description="Profile management coming soon..."
              />
            }
          />
          <Route
            path="/settings"
            element={
              <PlaceholderPage
                title="Settings"
                description="Settings management coming soon..."
              />
            }
          />
        </Routes>
      </main>
    </div>
  );
}
