import { Navigate, Outlet } from "react-router-dom";
import { useAuthAccess } from "@/features/auth";
import type { AppUserRole } from "@/shared/api/types/auth";
import { getHomeRouteForAppRole } from "@/shared/config/roleRoutes";
import { ROUTES } from "@/shared/config/routes";
import { AuthLoadingFallback } from "@/app/router/components/AuthLoadingFallback";

interface RoleGuardProps {
  allowed: AppUserRole[];
}

export function RoleGuard({ allowed }: RoleGuardProps) {
  const { appRole, isAuthenticated, isInitializing } = useAuthAccess();

  if (isInitializing) {
    return <AuthLoadingFallback />;
  }

  if (!isAuthenticated || !appRole) {
    return <Navigate to={ROUTES.login} replace />;
  }

  if (!allowed.includes(appRole)) {
    return <Navigate to={getHomeRouteForAppRole(appRole)} replace />;
  }

  return <Outlet />;
}
