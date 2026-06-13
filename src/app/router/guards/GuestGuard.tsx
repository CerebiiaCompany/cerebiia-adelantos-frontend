import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/features/auth";
import { ROUTES } from "@/shared/config/routes";

export function GuestGuard() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to={ROUTES.employee.dashboard} replace />;
  }

  return <Outlet />;
}
