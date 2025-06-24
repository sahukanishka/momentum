// Route parameter types
export interface RouteParams {
  employeeId?: string;
  projectId?: string;
  taskId?: string;
  organizationId?: string;
}

// Route configuration type
export interface RouteConfig {
  path: string;
  label: string;
  icon?: string;
  children?: RouteConfig[];
  requiresAuth?: boolean;
  requiredRole?: "admin" | "employee";
}

// Navigation item type
export interface NavigationItem {
  path: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  isActive?: boolean;
  children?: NavigationItem[];
}

// Breadcrumb item type
export interface BreadcrumbItem {
  label: string;
  path?: string;
  isActive?: boolean;
}
