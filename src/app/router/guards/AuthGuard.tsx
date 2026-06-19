import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthAccess } from "@/features/auth";
import { ROUTES } from "@/shared/config/routes";
import { AuthLoadingFallback } from "@/app/router/components/AuthLoadingFallback";

export function AuthGuard() {
  const { isAuthenticated, isInitializing } = useAuthAccess();
  const location = useLocation();

  if (isInitializing) {
    return <AuthLoadingFallback />;
  }

  if (!isAuthenticated) {
    return (
      <Navigate to={ROUTES.login} replace state={{ from: location }} />
    );
  }

  return <Outlet />;
}
