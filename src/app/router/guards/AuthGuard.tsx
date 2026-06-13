import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/features/auth";
import { ROUTES } from "@/shared/config/routes";

export function AuthGuard() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.login} replace />;
  }

  return <Outlet />;
}
