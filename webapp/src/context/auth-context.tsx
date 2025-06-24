// src/context/auth-context.tsx
import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  Dispatch,
} from "react";

// Define types
type User = {
  id: string;
  name: string;
  email: string;
  role: string;
};

type Organization = {
  id: string;
  name: string;
  domain: string;
};

type AuthState = {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  loading: boolean;
  error: string | null;
  role: string | null;
  organization: Organization | null;
  organizations: Organization[];
  organizationId: string | null;
};

type AuthAction =
  | {
      type: "LOGIN";
      payload: {
        user: User;
        access_token: string;
        refresh_token: string;
        organization: Organization;
        organizations: Organization[];
        organization_id: string;
      };
    }
  | { type: "LOGOUT" }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_ORGANIZATION"; payload: Organization };

type AuthContextType = {
  state: AuthState;
  dispatch: Dispatch<AuthAction>;
};

// Initial state
const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  token: null,
  refreshToken: null,
  loading: true, // Start with loading true
  error: null,
  role: null,
  organization: null,
  organizations: [],
  organizationId: null,
};

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Reducer function
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case "LOGIN":
      console.log(action.payload);
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.access_token,
        refreshToken: action.payload.refresh_token,
        role: action.payload.user.role,
        organization: action.payload?.organizations?.[0] || null,
        organizations: [...(action.payload.organizations || [])],
        organizationId: action.payload?.organizations?.[0]?.id || null,
        loading: false,
        error: null,
      };
    case "LOGOUT":
      localStorage.clear();
      return {
        ...initialState,
        loading: false,
      };
    case "SET_LOADING":
      return {
        ...state,
        loading: action.payload,
      };
    case "SET_ERROR":
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    case "SET_ORGANIZATION":
      return {
        ...state,
        organization: action.payload,
        organizationId: action.payload.id,
      };
    default:
      return state;
  }
};

// Provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Load auth state from localStorage on initial render
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem("token");
        const refreshToken = localStorage.getItem("refreshToken");
        const user = localStorage.getItem("user");
        const role = localStorage.getItem("role");
        const organizations = localStorage.getItem("organizations");
        const organization_id = localStorage.getItem("organization_id");
        const organization = localStorage.getItem("organization");

        if (token && refreshToken && user && role) {
          // Validate token here if needed
          const parsedOrganizations = organizations
            ? JSON.parse(organizations)
            : [];
          const parsedOrganization = organization
            ? JSON.parse(organization)
            : null;

          dispatch({
            type: "LOGIN",
            payload: {
              user: JSON.parse(user),
              access_token: token,
              refresh_token: refreshToken,
              organization:
                parsedOrganization ||
                (parsedOrganizations.length > 0
                  ? parsedOrganizations[0]
                  : null),
              organizations: parsedOrganizations,
              organization_id:
                organization_id ||
                (parsedOrganizations.length > 0
                  ? parsedOrganizations[0].id
                  : ""),
            },
          });
        } else {
          dispatch({ type: "SET_LOADING", payload: false });
        }
      } catch (error) {
        dispatch({ type: "SET_ERROR", payload: "Failed to restore session" });
      }
    };

    initializeAuth();
  }, []);

  // Save auth state to localStorage whenever it changes
  useEffect(() => {
    if (
      state.isAuthenticated &&
      state.token &&
      state.refreshToken &&
      state.user
    ) {
      localStorage.setItem("token", state.token);
      localStorage.setItem("refreshToken", state.refreshToken);
      localStorage.setItem("user", JSON.stringify(state.user));
      localStorage.setItem("role", state.role || "");
      localStorage.setItem(
        "organizations",
        JSON.stringify(state.organizations)
      );
      localStorage.setItem("organization_id", state.organizationId || "");
      localStorage.setItem("organization", JSON.stringify(state.organization));
    } else if (!state.loading) {
      // Only clear storage if we're not in the initial loading state
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      localStorage.removeItem("role");
      localStorage.removeItem("organizations");
      localStorage.removeItem("organization_id");
      localStorage.removeItem("organization");
    }
  }, [
    state.isAuthenticated,
    state.token,
    state.refreshToken,
    state.user,
    state.role,
    state.loading,
    state.organization,
    state.organizationId,
    state.organizations,
  ]);

  return (
    <AuthContext.Provider value={{ state, dispatch }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
