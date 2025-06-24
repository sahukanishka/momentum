import axios from "axios";
import { axiosInstance } from "./axios-instance";

type RequestType = {
  url: string;
  data?: any;
  headers?: Record<string, string>;
  signal?: AbortSignal;
};

type ConfigType = {
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  url: string;
  data?: any;
  headers?: Record<string, string>;
  signal?: AbortSignal;
};

// Centralized request function
const request = async ({ method, url, data, headers, signal }: ConfigType) => {
  try {
    const response = await axiosInstance({
      method,
      url,
      data,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        ...headers,
      },
      signal,
    });
    if (response.status >= 200 && response.status < 300) {
      return response.data;
    } else {
      throw response;
    }
  } catch (error: any) {
    if (error.response) {
      if (error.response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        window.location.href = "/login";
      } else {
        throw error.response.data;
      }
    }
  }
};

// GET request
export const GET = ({ url, signal }: RequestType) =>
  request({ method: "GET", url, signal });

// POST request
export const POST = ({ url, data, headers, signal }: RequestType) =>
  request({ method: "POST", url, data, headers, signal });

// PUT request
export const PUT = ({ url, data, headers, signal }: RequestType) =>
  request({ method: "PUT", url, data, headers, signal });

// PATCH request
export const PATCH = ({ url, data, headers, signal }: RequestType) =>
  request({ method: "PATCH", url, data, headers, signal });

// DELETE request
export const DELETE = ({ url, data, signal }: RequestType) =>
  request({ method: "DELETE", url, data, signal });
