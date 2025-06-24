import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Dashboard } from "./Dashboard";
import { EmployeesPage } from "../pages/admin/EmployeesPage";
import { ViewEmployeeDetailsPage } from "../pages/admin/ViewEmployeeDetailsPage";
import { useAuth } from "@/context/auth-context";
import { logoutUser } from "@/api/endpoints/auth";
import { toast } from "sonner";

export function AdminLayout() {
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
      <Sidebar userRole="admin" onLogout={handleLogout} />
      <main className="flex-1 overflow-auto">
        <Routes>
          <Route
            path="/"
            element={<Navigate to="/admin/dashboard" replace />}
          />
          <Route path="/dashboard" element={<Dashboard userRole="admin" />} />
          <Route
            path="/organizations"
            element={
              <div className="p-6">
                <h1 className="text-3xl font-bold text-foreground mb-4">
                  Organizations
                </h1>
                <div className="bg-card border border-border rounded-xl p-8 text-center">
                  <p className="text-muted-foreground">
                    Organizations management coming soon...
                  </p>
                </div>
              </div>
            }
          />
          <Route path="/employees" element={<EmployeesPage />} />
          {/* The :id parameter in the URL needs to match the param name used in useParams() */}
          <Route
            path="/employees/:employeeId"
            element={<ViewEmployeeDetailsPage />}
          />
          <Route
            path="/projects"
            element={
              <div className="p-6">
                <h1 className="text-3xl font-bold text-foreground mb-4">
                  Projects
                </h1>
                <div className="bg-card border border-border rounded-xl p-8 text-center">
                  <p className="text-muted-foreground">
                    Project management coming soon...
                  </p>
                </div>
              </div>
            }
          />
          <Route
            path="/tasks"
            element={
              <div className="p-6">
                <h1 className="text-3xl font-bold text-foreground mb-4">
                  All Tasks
                </h1>
                <div className="bg-card border border-border rounded-xl p-8 text-center">
                  <p className="text-muted-foreground">
                    Task management coming soon...
                  </p>
                </div>
              </div>
            }
          />
          <Route
            path="/timesheets"
            element={
              <div className="p-6">
                <h1 className="text-3xl font-bold text-foreground mb-4">
                  All Timesheets
                </h1>
                <div className="bg-card border border-border rounded-xl p-8 text-center">
                  <p className="text-muted-foreground">
                    Timesheet management coming soon...
                  </p>
                </div>
              </div>
            }
          />
          <Route
            path="/activity"
            element={
              <div className="p-6">
                <h1 className="text-3xl font-bold text-foreground mb-4">
                  Activity Monitor
                </h1>
                <div className="bg-card border border-border rounded-xl p-8 text-center">
                  <p className="text-muted-foreground">
                    Activity monitoring coming soon...
                  </p>
                </div>
              </div>
            }
          />
          <Route
            path="/analytics"
            element={
              <div className="p-6">
                <h1 className="text-3xl font-bold text-foreground mb-4">
                  Analytics
                </h1>
                <div className="bg-card border border-border rounded-xl p-8 text-center">
                  <p className="text-muted-foreground">
                    Analytics dashboard coming soon...
                  </p>
                </div>
              </div>
            }
          />
          <Route
            path="/calendar"
            element={
              <div className="p-6">
                <h1 className="text-3xl font-bold text-foreground mb-4">
                  Calendar
                </h1>
                <div className="bg-card border border-border rounded-xl p-8 text-center">
                  <p className="text-muted-foreground">
                    Calendar view coming soon...
                  </p>
                </div>
              </div>
            }
          />
          <Route
            path="/settings"
            element={
              <div className="p-6">
                <h1 className="text-3xl font-bold text-foreground mb-4">
                  Settings
                </h1>
                <div className="bg-card border border-border rounded-xl p-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        Account
                      </h3>
                      <p className="text-muted-foreground">
                        Logged in as: Administrator
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            }
          />
        </Routes>
      </main>
    </div>
  );
}
