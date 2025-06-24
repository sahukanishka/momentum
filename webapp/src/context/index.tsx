import AxiosInterceptor from "@/api/axios-instance";
import { AuthProvider } from "./auth-context";

function MainContext({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AxiosInterceptor>{children}</AxiosInterceptor>
    </AuthProvider>
  );
}

export default MainContext;
