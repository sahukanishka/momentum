import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { LoginPage } from "@/components/LoginPage";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AdminRoutes } from "@/routes/admin";
import { EmployeeRoutes } from "@/routes/employee";
import { DownloadApp } from "@/pages/DownloadApp";
import NotFoundPage from "@/pages/NotFound";

export function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/download" element={<DownloadApp />} />

      {/* Protected Admin Routes */}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminRoutes />
          </ProtectedRoute>
        }
      />

      {/* Protected Employee Routes */}
      <Route
        path="/employee/*"
        element={
          <ProtectedRoute requiredRole="employee">
            <EmployeeRoutes />
          </ProtectedRoute>
        }
      />

      {/* Default Routes */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
