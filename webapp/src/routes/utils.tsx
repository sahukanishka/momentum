import { useLocation, useNavigate } from "react-router-dom";
import { ROUTES } from "./constants";
import type { BreadcrumbItem } from "./types";

// Hook to get current route information
export const useRouteInfo = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const isAdminRoute = location.pathname.startsWith("/admin");
  const isEmployeeRoute = location.pathname.startsWith("/employee");
  const isLoginRoute = location.pathname === "/login";

  const getCurrentRole = () => {
    if (isAdminRoute) return "admin";
    if (isEmployeeRoute) return "employee";
    return null;
  };

  const getBreadcrumbs = (): BreadcrumbItem[] => {
    const pathSegments = location.pathname.split("/").filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [];

    if (pathSegments.length === 0) {
      return breadcrumbs;
    }

    // Add home breadcrumb
    breadcrumbs.push({
      label: "Home",
      path: isAdminRoute ? ROUTES.ADMIN.DASHBOARD : ROUTES.EMPLOYEE.DASHBOARD,
    });

    // Build breadcrumbs from path segments
    let currentPath = "";
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;

      // Skip the role segment (admin/employee)
      if (index === 0) return;

      const label =
        segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ");
      const isLast = index === pathSegments.length - 1;

      breadcrumbs.push({
        label,
        path: isLast ? undefined : currentPath,
        isActive: isLast,
      });
    });

    return breadcrumbs;
  };

  return {
    location,
    navigate,
    isAdminRoute,
    isEmployeeRoute,
    isLoginRoute,
    getCurrentRole,
    getBreadcrumbs,
  };
};

// Utility function to check if a route is active
export const isRouteActive = (
  currentPath: string,
  targetPath: string,
  exact = false
) => {
  if (exact) {
    return currentPath === targetPath;
  }
  return currentPath.startsWith(targetPath);
};

// Utility function to build dynamic routes
export const buildRoute = (
  baseRoute: string,
  params: Record<string, string>
) => {
  let route = baseRoute;
  Object.entries(params).forEach(([key, value]) => {
    route = route.replace(`:${key}`, value);
  });
  return route;
};

// Utility function to validate route parameters
export const validateRouteParams = (
  params: Record<string, any>,
  requiredParams: string[]
) => {
  const missingParams = requiredParams.filter((param) => !params[param]);
  if (missingParams.length > 0) {
    throw new Error(
      `Missing required route parameters: ${missingParams.join(", ")}`
    );
  }
  return true;
};
