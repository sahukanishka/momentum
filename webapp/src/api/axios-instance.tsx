import axios from "axios";
import { BASE_URL } from "@/utils/const";
import { toast } from "sonner";
import { useEffect } from "react";
import { useAuth } from "@/context/auth-context";
const axiosInstance = axios.create({
  baseURL: BASE_URL,
});

const AxiosInterceptor = ({ children }: { children: React.ReactNode }) => {
  const { state, dispatch } = useAuth();

  useEffect(() => {
    const interceptor = axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response) {
          if (error.response.status === 401) {
            dispatch({ type: "LOGOUT" });
            toast.error("Session expired. Please log in again.");
          } else {
            toast.error(error.response.data.message);
          }
        } else {
          // Handle network errors
          toast.error("Network error. Please check your connection.");
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axiosInstance.interceptors.response.eject(interceptor);
    };
  }, []);

  return children;
};

export default AxiosInterceptor;
export { axiosInstance };
