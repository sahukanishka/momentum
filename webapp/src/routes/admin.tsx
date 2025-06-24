import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Sidebar } from "@/components/Sidebar";
import { Dashboard } from "@/components/Dashboard";
import { EmployeesPage } from "@/pages/admin/EmployeesPage";
import { EmployeeDetailPage } from "@/pages/admin/EmployeeDetailPage";
import { ProjectsPage } from "@/pages/admin/ProjectsPage";
import { ProjectDetailsPage } from "@/pages/admin/ProjectDetailsPage";
import { TasksPage } from "@/pages/admin/TasksPage";
import { TaskDetailsPage } from "@/pages/admin/TaskDetailsPage";
import { TimeTrackingPage } from "@/pages/admin/TimeTrackingPage";
import { ScreenshotPage } from "@/pages/admin/ScreenshotPage";
import { OrganizationPage } from "@/pages/admin/OrganizationPage";
import { OrganizationDetailsPage } from "@/pages/admin/OrganizationDetailsPage";
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

export function AdminRoutes() {
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
          <Route path="/employees" element={<EmployeesPage />} />
          <Route
            path="/employees/:employeeId"
            element={<EmployeeDetailPage />}
          />
          <Route path="/organizations" element={<OrganizationPage />} />
          <Route
            path="/organizations/:organizationId"
            element={<OrganizationDetailsPage />}
          />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/projects/:projectId" element={<ProjectDetailsPage />} />
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/tasks/:taskId" element={<TaskDetailsPage />} />
          <Route path="/timesheets" element={<TimeTrackingPage />} />
          <Route path="/activity" element={<ScreenshotPage />} />
          <Route
            path="/analytics"
            element={
              <PlaceholderPage
                title="Analytics"
                description="Analytics dashboard coming soon..."
              />
            }
          />
          <Route
            path="/calendar"
            element={
              <PlaceholderPage
                title="Calendar"
                description="Calendar view coming soon..."
              />
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
