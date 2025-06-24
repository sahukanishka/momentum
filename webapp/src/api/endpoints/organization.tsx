import { GET, POST, PUT, DELETE } from "../https";

interface CreateOrganizationData {
  name: string;
  description: string;
  domain: string;
}

export const createOrganization = (data: CreateOrganizationData) =>
  POST({
    url: "/api/v1/organizations/",
    data,
  });

export const getUserOrganizations = (page?: number, size?: number) =>
  GET({
    url: "/api/v1/organizations/",
    data: { page, size },
  });

export const getOrganizationById = (id: string) =>
  GET({
    url: `/api/v1/organizations/${id}`,
    data: {},
  });

interface UpdateOrganizationData {
  name: string;
  description: string;
  domain: string;
}

export const updateOrganization = (id: string, data: UpdateOrganizationData) =>
  PUT({
    url: `/api/v1/organizations/${id}`,
    data,
  });

export const deleteOrganization = (id: string) =>
  DELETE({
    url: `/api/v1/organizations/${id}`,
    data: {},
  });

export const getOrganizationByDomain = (domain: string) =>
  GET({
    url: `/api/v1/organizations/domain/${domain}`,
    data: {},
  });
