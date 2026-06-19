import { Navigate, Outlet } from "react-router-dom";
import { useAuthAccess } from "@/features/auth";
import { authStorage } from "@/shared/api";
import { getHomeRouteForAppRole } from "@/shared/config/roleRoutes";
import { ROUTES } from "@/shared/config/routes";
import { AuthLoadingFallback } from "@/app/router/components/AuthLoadingFallback";

export function GuestGuard() {
  const { isAuthenticated, isInitializing, appRole } = useAuthAccess();
  const hasStoredSession = authStorage.get() !== null;

  if (hasStoredSession && isInitializing) {
    return <AuthLoadingFallback />;
  }

  if (isAuthenticated && appRole) {
    return <Navigate to={getHomeRouteForAppRole(appRole)} replace />;
  }

  if (isAuthenticated) {
    return <Navigate to={ROUTES.login} replace />;
  }

  return <Outlet />;
}
