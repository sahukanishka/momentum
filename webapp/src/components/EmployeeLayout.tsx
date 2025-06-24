
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Dashboard } from "./Dashboard";
import { useAuth } from "@/context/auth-context";
import { logoutUser } from "@/api/endpoints/auth";
import { toast } from "sonner";

export function EmployeeLayout() {
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
      <Sidebar
        userRole="employee"
        onLogout={handleLogout}
      />
      <main className="flex-1 overflow-auto">
        <Routes>
          <Route path="/" element={<Navigate to="/employee/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard userRole="employee" />} />
          <Route path="/tasks" element={
            <div className="p-6">
              <h1 className="text-3xl font-bold text-foreground mb-4">My Tasks</h1>
              <div className="bg-card border border-border rounded-xl p-8 text-center">
                <p className="text-muted-foreground">Task management coming soon...</p>
              </div>
            </div>
          } />
          <Route path="/timesheet" element={
            <div className="p-6">
              <h1 className="text-3xl font-bold text-foreground mb-4">My Timesheet</h1>
              <div className="bg-card border border-border rounded-xl p-8 text-center">
                <p className="text-muted-foreground">Timesheet management coming soon...</p>
              </div>
            </div>
          } />
          <Route path="/calendar" element={
            <div className="p-6">
              <h1 className="text-3xl font-bold text-foreground mb-4">Calendar</h1>
              <div className="bg-card border border-border rounded-xl p-8 text-center">
                <p className="text-muted-foreground">Calendar view coming soon...</p>
              </div>
            </div>
          } />
          <Route path="/settings" element={
            <div className="p-6">
              <h1 className="text-3xl font-bold text-foreground mb-4">Settings</h1>
              <div className="bg-card border border-border rounded-xl p-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Account</h3>
                    <p className="text-muted-foreground">Logged in as: Employee</p>
                  </div>
                </div>
              </div>
            </div>
          } />
        </Routes>
      </main>
    </div>
  );
}
