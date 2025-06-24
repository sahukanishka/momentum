import { GET, POST, PUT, DELETE } from "../https";

interface UploadScreenshotData {
  employee_id: string;
  organization_id: string;
  tracking_id: string;
  project_id: string;
  task_id: string;
  path: string;
  permission: boolean;
  os: string;
  geo_location: string;
  ip_address: string;
  app: string;
}

export const uploadScreenshot = (data: UploadScreenshotData) =>
  POST({
    url: "/api/v1/screenshots/upload",
    data,
  });

export const getScreenshotById = (id: string) =>
  GET({
    url: `/api/v1/screenshots/${id}`,
    data: {},
  });

interface EmployeeScreenshotsParams {
  tracking_id?: string;
  project_id?: string;
  task_id?: string;
  permission?: boolean;
  app?: string;
  os?: string;
  start_date?: string;
  end_date?: string;
  sort_by?: string;
  sort_order?: string;
  page?: number;
  size?: number;
}

export const getEmployeeScreenshots = (
  employeeId: string,
  params?: EmployeeScreenshotsParams
) =>
  GET({
    url: `/api/v1/screenshots/employee/${employeeId}/screenshots`,
    data: params,
  });

interface OrganizationScreenshotsParams {
  employee_id?: string;
  tracking_id?: string;
  project_id?: string;
  task_id?: string;
  permission?: boolean;
  app?: string;
  os?: string;
  start_date?: string;
  end_date?: string;
  sort_by?: string;
  sort_order?: string;
  page?: number;
  size?: number;
}

export const getOrganizationScreenshots = (
  orgId: string,
  params?: OrganizationScreenshotsParams
) =>
  GET({
    url: `/api/v1/screenshots/organization/${orgId}/screenshots`,
    data: params,
  });

interface ProjectScreenshotsParams {
  employee_id?: string;
  organization_id?: string;
  tracking_id?: string;
  task_id?: string;
  permission?: boolean;
  app?: string;
  os?: string;
  start_date?: string;
  end_date?: string;
  sort_by?: string;
  sort_order?: string;
  page?: number;
  size?: number;
}

export const getProjectScreenshots = (
  projectId: string,
  params?: ProjectScreenshotsParams
) =>
  GET({
    url: `/api/v1/screenshots/project/${projectId}/screenshots`,
    data: params,
  });

interface TaskScreenshotsParams {
  employee_id?: string;
  organization_id?: string;
  tracking_id?: string;
  project_id?: string;
  permission?: boolean;
  app?: string;
  os?: string;
  start_date?: string;
  end_date?: string;
  sort_by?: string;
  sort_order?: string;
  page?: number;
  size?: number;
}

export const getTaskScreenshots = (
  taskId: string,
  params?: TaskScreenshotsParams
) =>
  GET({
    url: `/api/v1/screenshots/task/${taskId}/screenshots`,
    data: params,
  });

interface UpdateScreenshotData {
  permission: boolean;
  notes: string;
}

export const updateScreenshot = (id: string, data: UpdateScreenshotData) =>
  PUT({
    url: `/api/v1/screenshots/${id}`,
    data,
  });

export const deleteScreenshot = (id: string) =>
  DELETE({
    url: `/api/v1/screenshots/${id}`,
    data: {},
  });
