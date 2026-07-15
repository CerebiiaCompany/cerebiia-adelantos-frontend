import { Navigate, Outlet } from "react-router-dom";
import { useAuthAccess } from "@/features/auth";
import { authStorage } from "@/shared/api";
import { getHomeRouteForAppRole, getPostLoginRoute } from "@/shared/config/roleRoutes";
import { ROUTES } from "@/shared/config/routes";
import { AuthLoadingFallback } from "@/app/router/components/AuthLoadingFallback";

export function GuestGuard() {
  const { isAuthenticated, isInitializing, appRole, session } = useAuthAccess();
  const hasStoredSession = authStorage.get() !== null;

  if (hasStoredSession && isInitializing) {
    return <AuthLoadingFallback />;
  }

  if (isAuthenticated && appRole) {
    const effectiveSession = session ?? authStorage.get();
    if (effectiveSession) {
      return <Navigate to={getPostLoginRoute(effectiveSession)} replace />;
    }
    return <Navigate to={getHomeRouteForAppRole(appRole)} replace />;
  }

  if (isAuthenticated) {
    return <Navigate to={ROUTES.login} replace />;
  }

  return <Outlet />;
}
