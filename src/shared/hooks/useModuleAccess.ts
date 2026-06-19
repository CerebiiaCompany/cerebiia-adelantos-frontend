import { useAuth } from "@/features/auth";
import {
  canAccessModule,
  canAccessPath,
  type AppModuleId,
} from "@/shared/config/moduleAccess";

export function useModuleAccess() {
  const { appRole } = useAuth();

  return {
    appRole,
    canAccessModule: (moduleId: AppModuleId) =>
      canAccessModule(appRole, moduleId),
    canAccessPath: (pathname: string) => canAccessPath(appRole, pathname),
  };
}
