import { GET, POST, PUT, PATCH, DELETE } from "../https";

interface CreateProjectData {
  name: string;
  description: string;
  code: string;
  organization_id: string;
  max_hours_per_week: number;
  max_hours_per_day: number;
  start_date: string;
  end_date: string;
}

export const createProject = (data: CreateProjectData) =>
  POST({
    url: "/api/v1/projects/",
    data,
  });

export const getOrganizationProjects = (
  orgId: string,
  page?: number,
  size?: number
) =>
  GET({
    url: `/api/v1/projects/organization/${orgId}`,
    data: { page, size },
  });

export const getProjectById = (id: string) =>
  GET({
    url: `/api/v1/projects/${id}`,
    data: {},
  });

interface UpdateProjectData {
  name: string;
  description: string;
  code: string;
  max_hours_per_week: number;
  max_hours_per_day: number;
  start_date: string;
  end_date: string;
}

export const updateProject = (id: string, data: UpdateProjectData) =>
  PUT({
    url: `/api/v1/projects/${id}`,
    data,
  });

export const deleteProject = (id: string) =>
  DELETE({
    url: `/api/v1/projects/${id}`,
    data: {},
  });

export const archiveProject = (id: string) =>
  PATCH({
    url: `/api/v1/projects/${id}/archive`,
    data: {},
  });

export const unarchiveProject = (id: string) =>
  PATCH({
    url: `/api/v1/projects/${id}/unarchive`,
    data: {},
  });

interface AssignEmployeesData {
  employee_ids: string[];
}

export const assignEmployeesToProject = (
  id: string,
  data: AssignEmployeesData
) =>
  POST({
    url: `/api/v1/projects/${id}/assign-employees`,
    data,
  });

export const removeEmployeesFromProject = (
  id: string,
  data: AssignEmployeesData
) =>
  POST({
    url: `/api/v1/projects/${id}/remove-employees`,
    data,
  });

export const getProjectEmployees = (id: string) =>
  GET({
    url: `/api/v1/projects/${id}/employees`,
    data: {},
  });
