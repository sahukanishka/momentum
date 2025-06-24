// Route constants for better maintainability
export const ROUTES = {
  // Public routes
  LOGIN: "/login",

  // Admin routes
  ADMIN: {
    ROOT: "/admin",
    DASHBOARD: "/admin/dashboard",
    EMPLOYEES: "/admin/employees",
    EMPLOYEE_DETAILS: (id: string) => `/admin/employees/${id}`,
    ORGANIZATIONS: "/admin/organizations",
    PROJECTS: "/admin/projects",
    TASKS: "/admin/tasks",
    TIMESHEETS: "/admin/timesheets",
    ACTIVITY: "/admin/activity",
    ANALYTICS: "/admin/analytics",
    CALENDAR: "/admin/calendar",
    SETTINGS: "/admin/settings",
  },

  // Employee routes
  EMPLOYEE: {
    ROOT: "/employee",
    DASHBOARD: "/employee/dashboard",
    TIME_TRACKING: "/employee/time-tracking",
    PROJECTS: "/employee/projects",
    TASKS: "/employee/tasks",
    PROFILE: "/employee/profile",
    SETTINGS: "/employee/settings",
  },
} as const;

// Route groups for easier navigation
export const ADMIN_ROUTES = [
  { path: ROUTES.ADMIN.DASHBOARD, label: "Dashboard" },
  { path: ROUTES.ADMIN.EMPLOYEES, label: "Employees" },
  { path: ROUTES.ADMIN.ORGANIZATIONS, label: "Organizations" },
  { path: ROUTES.ADMIN.PROJECTS, label: "Projects" },
  { path: ROUTES.ADMIN.TASKS, label: "Tasks" },
  { path: ROUTES.ADMIN.TIMESHEETS, label: "Timesheets" },
  { path: ROUTES.ADMIN.ACTIVITY, label: "Activity" },
  { path: ROUTES.ADMIN.ANALYTICS, label: "Analytics" },
  { path: ROUTES.ADMIN.CALENDAR, label: "Calendar" },
  { path: ROUTES.ADMIN.SETTINGS, label: "Settings" },
];

export const EMPLOYEE_ROUTES = [
  { path: ROUTES.EMPLOYEE.DASHBOARD, label: "Dashboard" },
  { path: ROUTES.EMPLOYEE.TIME_TRACKING, label: "Time Tracking" },
  { path: ROUTES.EMPLOYEE.PROJECTS, label: "Projects" },
  { path: ROUTES.EMPLOYEE.TASKS, label: "Tasks" },
  { path: ROUTES.EMPLOYEE.PROFILE, label: "Profile" },
  { path: ROUTES.EMPLOYEE.SETTINGS, label: "Settings" },
];
