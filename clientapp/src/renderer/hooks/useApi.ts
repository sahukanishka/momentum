import { useAuth } from "../contexts/AuthContext";

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

interface ApiOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  headers?: Record<string, string>;
  body?: any;
  skipAuth?: boolean;
}

export const useApi = () => {
  const { tokens, refreshAuth, logout } = useAuth();

  const makeRequest = async <T = any>(
    endpoint: string,
    options: ApiOptions = {}
  ): Promise<ApiResponse<T>> => {
    const { method = "GET", headers = {}, body, skipAuth = false } = options;

    const baseUrl = "http://127.0.0.1:8000/api/v1";
    const url = `${baseUrl}${endpoint}`;

    // Prepare headers
    const requestHeaders: Record<string, string> = {
      "Content-Type": "application/json",
      ...headers,
    };

    // Add authorization header if not skipped
    if (!skipAuth && tokens?.access_token) {
      requestHeaders["Authorization"] = `Bearer ${tokens.access_token}`;
    }

    // Prepare request config
    const config: RequestInit = {
      method,
      headers: requestHeaders,
    };

    // Add body for non-GET requests
    if (body && method !== "GET") {
      config.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(url, config);

      // Handle 401 Unauthorized - try to refresh token
      if (response.status === 401 && !skipAuth) {
        const refreshSuccess = await refreshAuth();
        if (refreshSuccess) {
          // Retry the request with new token
          return makeRequest<T>(endpoint, options);
        } else {
          // Refresh failed, logout user
          logout();
          return {
            success: false,
            error: "Authentication expired. Please login again.",
          };
        }
      }

      // Handle other error status codes
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error:
            errorData.message ||
            `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      // Parse successful response
      const data = await response.json();
      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error("API request error:", error);
      return {
        success: false,
        error: "Network error. Please check your connection.",
      };
    }
  };

  // Convenience methods for common HTTP methods
  const get = <T = any>(
    endpoint: string,
    options?: Omit<ApiOptions, "method">
  ) => makeRequest<T>(endpoint, { ...options, method: "GET" });

  const post = <T = any>(
    endpoint: string,
    body?: any,
    options?: Omit<ApiOptions, "method" | "body">
  ) => makeRequest<T>(endpoint, { ...options, method: "POST", body });

  const put = <T = any>(
    endpoint: string,
    body?: any,
    options?: Omit<ApiOptions, "method" | "body">
  ) => makeRequest<T>(endpoint, { ...options, method: "PUT", body });

  const patch = <T = any>(
    endpoint: string,
    body?: any,
    options?: Omit<ApiOptions, "method" | "body">
  ) => makeRequest<T>(endpoint, { ...options, method: "PATCH", body });

  const del = <T = any>(
    endpoint: string,
    options?: Omit<ApiOptions, "method">
  ) => makeRequest<T>(endpoint, { ...options, method: "DELETE" });

  return {
    makeRequest,
    get,
    post,
    put,
    patch,
    delete: del,
  };
};

export default useApi;
