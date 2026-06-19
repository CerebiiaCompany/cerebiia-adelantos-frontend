import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuthAccess } from "@/features/auth";
import {
  canAccessModule,
  type AppModuleId,
} from "@/shared/config/moduleAccess";
import { getHomeRouteForAppRole } from "@/shared/config/roleRoutes";
import { ROUTES } from "@/shared/config/routes";
import { AuthLoadingFallback } from "@/app/router/components/AuthLoadingFallback";

interface ModuleGuardProps {
  moduleId: AppModuleId;
  children: ReactNode;
}

export function ModuleGuard({ moduleId, children }: ModuleGuardProps) {
  const { appRole, isInitializing, isAuthenticated } = useAuthAccess();

  if (isInitializing) {
    return <AuthLoadingFallback />;
  }

  if (!isAuthenticated || !appRole) {
    return <Navigate to={ROUTES.login} replace />;
  }

  if (!canAccessModule(appRole, moduleId)) {
    return <Navigate to={getHomeRouteForAppRole(appRole)} replace />;
  }

  return children;
}
