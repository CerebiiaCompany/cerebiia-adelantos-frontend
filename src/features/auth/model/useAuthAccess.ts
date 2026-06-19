import { authStorage, resolveAppRole } from "@/shared/api";
import type { AppUserRole, AuthSession } from "@/shared/api/types/auth";
import { useAuth } from "./AuthProvider";

/**
 * Combina el estado de React con la sesión en localStorage.
 * Evita condiciones de carrera justo después del login (navigate antes del re-render).
 */
export function useAuthAccess() {
  const auth = useAuth();
  const storedSession = authStorage.get();
  const effectiveSession: AuthSession | null = auth.session ?? storedSession;
  const storedRole = storedSession ? resolveAppRole(storedSession) : null;
  const effectiveRole: AppUserRole | null = auth.appRole ?? storedRole;
  const effectiveAuthenticated =
    effectiveRole !== null &&
    (auth.isAuthenticated || (!auth.isInitializing && storedRole !== null));

  return {
    ...auth,
    session: effectiveSession,
    appRole: effectiveRole,
    isAuthenticated: effectiveAuthenticated,
  };
}
