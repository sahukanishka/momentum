import { GET, POST, PUT, DELETE } from "../https";

interface CreateTaskData {
  name: string;
  description: string;
  code: string;
  project_id: string;
  max_hours_per_week: number;
  max_hours_per_day: number;
  start_date: string;
  end_date: string;
}

export const createTask = (data: CreateTaskData) =>
  POST({
    url: "/api/v1/tasks/",
    data,
  });

interface CreateDefaultTaskData {
  name: string;
  description: string;
  code: string;
  max_hours_per_week: number;
  max_hours_per_day: number;
  start_date: string;
  end_date: string;
}

export const createDefaultTask = (
  projectId: string,
  data: CreateDefaultTaskData
) =>
  POST({
    url: `/api/v1/tasks/project/${projectId}/default`,
    data,
  });

export const getProjectTasks = (
  projectId: string,
  page?: number,
  size?: number
) =>
  GET({
    url: `/api/v1/tasks/project/${projectId}`,
    data: { page, size },
  });

export const getOrganizationTasks = (
  orgId: string,
  page?: number,
  size?: number
) =>
  GET({
    url: `/api/v1/tasks/organization/${orgId}`,
    data: { page, size },
  });

export const getTaskById = (id: string) =>
  GET({
    url: `/api/v1/tasks/${id}`,
    data: {},
  });

interface UpdateTaskData {
  name: string;
  description: string;
  code: string;
  max_hours_per_week: number;
  max_hours_per_day: number;
  start_date: string;
  end_date: string;
}

export const updateTask = (id: string, data: UpdateTaskData) =>
  PUT({
    url: `/api/v1/tasks/${id}`,
    data,
  });

export const deleteTask = (id: string) =>
  DELETE({
    url: `/api/v1/tasks/${id}`,
    data: {},
  });

interface AssignEmployeesData {
  employee_ids: string[];
}

export const assignEmployeesToTask = (id: string, data: AssignEmployeesData) =>
  POST({
    url: `/api/v1/tasks/${id}/assign-employees`,
    data,
  });

export const removeEmployeesFromTask = (
  id: string,
  data: AssignEmployeesData
) =>
  POST({
    url: `/api/v1/tasks/${id}/remove-employees`,
    data,
  });

export const getTaskEmployees = (id: string) =>
  GET({
    url: `/api/v1/tasks/${id}/employees`,
    data: {},
  });
