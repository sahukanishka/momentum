import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Calendar,
  Users,
  FolderOpen,
  CheckSquare,
  Clock,
  Monitor,
  TrendingUp,
  Settings,
  Menu,
  X,
  Building2,
  LogOut,
} from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { useAuth } from "@/context/auth-context";

interface SidebarProps {
  userRole: "admin" | "employee";
  onLogout: () => void;
}

export function Sidebar({ userRole, onLogout }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { state } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const adminMenuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: TrendingUp,
      path: "/admin/dashboard",
    },
    {
      id: "organizations",
      label: "Organizations",
      icon: Building2,
      path: "/admin/organizations",
    },
    {
      id: "employees",
      label: "Employees",
      icon: Users,
      path: "/admin/employees",
    },
    {
      id: "projects",
      label: "Projects",
      icon: FolderOpen,
      path: "/admin/projects",
    },
    { id: "tasks", label: "Tasks", icon: CheckSquare, path: "/admin/tasks" },
    {
      id: "timesheets",
      label: "Timesheets",
      icon: Clock,
      path: "/admin/timesheets",
    },
    {
      id: "activity",
      label: "Activity Monitor",
      icon: Monitor,
      path: "/admin/activity",
    },
    {
      id: "analytics",
      label: "Analytics",
      icon: TrendingUp,
      path: "/admin/analytics",
    },
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
      path: "/admin/settings",
    },
  ];

  const employeeMenuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: TrendingUp,
      path: "/employee/dashboard",
    },
    {
      id: "tasks",
      label: "My Tasks",
      icon: CheckSquare,
      path: "/employee/tasks",
    },
    {
      id: "timesheet",
      label: "Timesheet",
      icon: Clock,
      path: "/employee/timesheet",
    },
    {
      id: "calendar",
      label: "Calendar",
      icon: Calendar,
      path: "/employee/calendar",
    },
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
      path: "/employee/settings",
    },
  ];

  const menuItems = userRole === "admin" ? adminMenuItems : employeeMenuItems;

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const isActivePath = (path: string) => {
    return (
      location.pathname === path || location.pathname.startsWith(path + "/")
    );
  };

  return (
    <div
      className={`h-screen bg-card border-r border-border transition-all duration-300 ${
        isCollapsed ? "w-16" : "w-64"
      }`}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            {!isCollapsed && (
              <div className="flex items-center space-x-2">
                <Building2 className="h-6 w-6" />
                <span className="font-semibold text-lg">Momentum</span>
              </div>
            )}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1 rounded-lg hover:bg-accent transition-colors"
            >
              {isCollapsed ? (
                <Menu className="h-5 w-5" />
              ) : (
                <X className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = isActivePath(item.path);

            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.path)}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-accent hover:text-accent-foreground"
                }`}
              >
                <IconComponent className="h-5 w-5 flex-shrink-0" />
                {!isCollapsed && (
                  <span className="text-sm font-medium">{item.label}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-border">
          <div className="space-y-2">
            {!isCollapsed && (
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-primary-foreground text-sm font-medium">
                    {state.user?.name?.charAt(0) ||
                      (userRole === "admin" ? "A" : "E")}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {state.user?.name ||
                      (userRole === "admin" ? "Admin User" : "Employee")}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {state.user?.email ||
                      (userRole === "admin" ? "Administrator" : "Team Member")}
                  </p>
                </div>
              </div>
            )}
            <div className="flex items-center justify-between">
              <button
                onClick={onLogout}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors text-sm"
              >
                <LogOut className="h-4 w-4" />
                {!isCollapsed && <span>Logout</span>}
              </button>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
