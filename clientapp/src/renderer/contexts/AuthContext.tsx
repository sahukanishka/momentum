import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
  avatar?: string;
}

interface Tokens {
  access_token: string;
  refresh_token: string;
}

interface AuthContextType {
  // User data
  user: User | null;
  tokens: Tokens | null;

  // Organization and project data
  organizationId: string | null;
  projectId: string | null;
  taskId: string | null;
  employeeId: string | null;
  trackingId: string | null;

  // Authentication state
  isAuthenticated: boolean;
  isLoading: boolean;

  // Methods
  login: (userData: User, tokens: Tokens, orgData?: Partial<OrgData>) => void;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  updateTokens: (tokens: Partial<Tokens>) => void;
  setOrganizationData: (orgData: Partial<OrgData>) => void;
  setProjectData: (projectData: Partial<ProjectData>) => void;
  setTaskData: (taskData: Partial<TaskData>) => void;
  setTrackingData: (trackingData: Partial<TrackingData>) => void;
  refreshAuth: () => Promise<boolean>;
}

interface OrgData {
  organizationId: string;
  employeeId: string;
}

interface ProjectData {
  projectId: string;
}

interface TaskData {
  taskId: string;
}

interface TrackingData {
  trackingId: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [tokens, setTokens] = useState<Tokens | null>(null);
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [employeeId, setEmployeeId] = useState<string | null>(null);
  const [trackingId, setTrackingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load initial auth state from localStorage
  useEffect(() => {
    const loadAuthState = () => {
      try {
        const savedUser = localStorage.getItem("momentum_user");
        const savedTokens = localStorage.getItem("momentum_tokens");
        const savedOrgId = localStorage.getItem("momentum_organization_id");
        const savedProjectId = localStorage.getItem("momentum_project_id");
        const savedTaskId = localStorage.getItem("momentum_task_id");
        const savedEmployeeId = localStorage.getItem("momentum_employee_id");
        const savedTrackingId = localStorage.getItem("momentum_tracking_id");

        if (savedUser && savedTokens) {
          setUser(JSON.parse(savedUser));
          setTokens(JSON.parse(savedTokens));

          if (savedOrgId) setOrganizationId(savedOrgId);
          if (savedProjectId) setProjectId(savedProjectId);
          if (savedTaskId) setTaskId(savedTaskId);
          if (savedEmployeeId) setEmployeeId(savedEmployeeId);
          if (savedTrackingId) setTrackingId(savedTrackingId);
        }
      } catch (error) {
        console.error("Error loading auth state:", error);
        // Clear corrupted data
        localStorage.removeItem("momentum_user");
        localStorage.removeItem("momentum_tokens");
        localStorage.removeItem("momentum_organization_id");
        localStorage.removeItem("momentum_project_id");
        localStorage.removeItem("momentum_task_id");
        localStorage.removeItem("momentum_employee_id");
        localStorage.removeItem("momentum_tracking_id");
      } finally {
        setIsLoading(false);
      }
    };

    loadAuthState();
  }, []);

  const login = (
    userData: User,
    tokens: Tokens,
    orgData?: Partial<OrgData>
  ) => {
    setUser(userData);
    setTokens(tokens);

    if (orgData?.organizationId) {
      setOrganizationId(orgData.organizationId);
      localStorage.setItem("momentum_organization_id", orgData.organizationId);
    }

    if (orgData?.employeeId) {
      setEmployeeId(orgData.employeeId);
      localStorage.setItem("momentum_employee_id", orgData.employeeId);
    }

    // Save to localStorage
    localStorage.setItem("momentum_user", JSON.stringify(userData));
    localStorage.setItem("momentum_tokens", JSON.stringify(tokens));
  };

  const logout = () => {
    setUser(null);
    setTokens(null);
    setOrganizationId(null);
    setProjectId(null);
    setTaskId(null);
    setEmployeeId(null);
    setTrackingId(null);

    // Clear localStorage
    localStorage.removeItem("momentum_user");
    localStorage.removeItem("momentum_tokens");
    localStorage.removeItem("momentum_organization_id");
    localStorage.removeItem("momentum_project_id");
    localStorage.removeItem("momentum_task_id");
    localStorage.removeItem("momentum_employee_id");
    localStorage.removeItem("momentum_tracking_id");
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem("momentum_user", JSON.stringify(updatedUser));
    }
  };

  const updateTokens = (newTokens: Partial<Tokens>) => {
    if (tokens) {
      const updatedTokens = { ...tokens, ...newTokens };
      setTokens(updatedTokens);
      localStorage.setItem("momentum_tokens", JSON.stringify(updatedTokens));
    }
  };

  const setOrganizationData = (orgData: Partial<OrgData>) => {
    if (orgData.organizationId) {
      setOrganizationId(orgData.organizationId);
      localStorage.setItem("momentum_organization_id", orgData.organizationId);
    }

    if (orgData.employeeId) {
      setEmployeeId(orgData.employeeId);
      localStorage.setItem("momentum_employee_id", orgData.employeeId);
    }
  };

  const setProjectData = (projectData: Partial<ProjectData>) => {
    if (projectData.projectId) {
      setProjectId(projectData.projectId);
      localStorage.setItem("momentum_project_id", projectData.projectId);
    }
  };

  const setTaskData = (taskData: Partial<TaskData>) => {
    if (taskData.taskId) {
      setTaskId(taskData.taskId);
      localStorage.setItem("momentum_task_id", taskData.taskId);
    }
  };

  const setTrackingData = (trackingData: Partial<TrackingData>) => {
    if (trackingData.trackingId) {
      setTrackingId(trackingData.trackingId);
      localStorage.setItem("momentum_tracking_id", trackingData.trackingId);
    }
  };

  const refreshAuth = async (): Promise<boolean> => {
    if (!tokens?.refresh_token) {
      return false;
    }

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/v1/auth/refresh",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            refresh_token: tokens.refresh_token,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data?.access_token) {
          updateTokens({
            access_token: data.data.access_token,
            refresh_token: data.data.refresh_token || tokens.refresh_token,
          });
          return true;
        }
      }

      // If refresh fails, logout
      logout();
      return false;
    } catch (error) {
      console.error("Error refreshing auth:", error);
      logout();
      return false;
    }
  };

  const value: AuthContextType = {
    user,
    tokens,
    organizationId,
    projectId,
    taskId,
    employeeId,
    trackingId,
    isAuthenticated: !!user && !!tokens?.access_token,
    isLoading,
    login,
    logout,
    updateUser,
    updateTokens,
    setOrganizationData,
    setProjectData,
    setTaskData,
    setTrackingData,
    refreshAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
