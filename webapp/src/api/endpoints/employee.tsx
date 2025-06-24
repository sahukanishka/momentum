import { GET, POST, PUT, PATCH, DELETE } from "../https";

interface CreateEmployeeData {
  name: string;
  email: string;
  password: string;
  organization_id: string;
}

export const createEmployee = (data: CreateEmployeeData) =>
  POST({
    url: "/api/v1/employees/",
    data,
  });

export const getOrganizationEmployees = (
  orgId: string,
  page?: number,
  size?: number
) =>
  GET({
    url: `/api/v1/employees/organization/${orgId}`,
    data: { page, size },
  });

export const getEmployeeById = (id: string) =>
  GET({
    url: `/api/v1/employees/${id}`,
    data: {},
  });

interface UpdateEmployeeData {
  name: string;
  email: string;
}

export const updateEmployee = (id: string, data: UpdateEmployeeData) =>
  PUT({
    url: `/api/v1/employees/${id}`,
    data,
  });

export const deleteEmployee = (id: string) =>
  DELETE({
    url: `/api/v1/employees/${id}`,
    data: {},
  });

export const deactivateEmployee = (id: string) =>
  PATCH({
    url: `/api/v1/employees/${id}/deactivate`,
    data: {},
  });

export const activateEmployee = (id: string) =>
  PATCH({
    url: `/api/v1/employees/${id}/activate`,
    data: {},
  });
