import {

  createContext,

  useCallback,

  useContext,

  useEffect,

  useMemo,

  useState,

  type ReactNode,

} from "react";

import {

  authEndpoints,

  authStorage,

  getRefreshDelayMs,

  isAccessTokenExpired,

  isEmpleadoSession,

  isSystemUserSession,

  refreshAuthTokens,

  registerAuthSessionListener,

  registerUnauthorizedHandler,

  resolveAppRole,

  normalizeEmpleadoProfile,

} from "@/shared/api";

import { isEmpleadoLocallyDeactivated } from "@/entities/empleado";

import type { AppUserRole, AuthSession } from "@/shared/api/types/auth";

import { env } from "@/shared/config/env";
import { withTimeout } from "@/shared/utils/withTimeout";

const BOOTSTRAP_TIMEOUT_MS = 10_000;



interface AuthContextValue {

  session: AuthSession | null;

  isAuthenticated: boolean;

  isInitializing: boolean;

  appRole: AppUserRole | null;

  login: (session: AuthSession) => void;

  logout: () => void;

}



const AuthContext = createContext<AuthContextValue | null>(null);



async function restoreSystemUserSession(
  stored: AuthSession & { actorType: "system_user" },
): Promise<AuthSession | null> {
  if (!resolveAppRole(stored)) return null;

  let current = stored;

  if (isAccessTokenExpired(current.accessToken)) {
    const refreshed = await refreshAuthTokens();
    if (!refreshed) return null;

    const latest = authStorage.get();
    if (!latest || !isSystemUserSession(latest)) return null;
    current = latest;
  }

  // El login ya devuelve el perfil completo; evita /auth/me/ en bootstrap
  // (reduce 401 en consola y no borra la sesión si /me falla).
  if (current.user?.email && current.user?.role) {
    return current;
  }

  try {
    const user = await authEndpoints.me();
    const session = { ...current, user };
    authStorage.set(session);
    return session;
  } catch {
    const refreshed = await refreshAuthTokens();
    if (!refreshed) return null;

    try {
      const user = await authEndpoints.me();
      const latest = authStorage.get();
      if (!latest || !isSystemUserSession(latest)) return null;

      const session = { ...latest, user };
      authStorage.set(session);
      return session;
    } catch {
      return null;
    }
  }
}



function restoreEmpleadoSession(stored: AuthSession): AuthSession | null {

  if (isAccessTokenExpired(stored.accessToken)) {

    return null;

  }



  if (!isEmpleadoSession(stored) || stored.empleado.estado !== "activo") {

    return null;

  }



  if (

    isEmpleadoLocallyDeactivated(

      stored.empleado.empresa_id,

      stored.empleado.id,

    )

  ) {

    return null;

  }



  return {
    ...stored,
    empleado: normalizeEmpleadoProfile(stored.empleado),
  };

}



export function AuthProvider({ children }: { children: ReactNode }) {

  const [session, setSession] = useState<AuthSession | null>(null);

  const [isInitializing, setIsInitializing] = useState(true);



  const login = useCallback((next: AuthSession) => {

    authStorage.set(next);

    setSession(next);

  }, []);



  const logout = useCallback(() => {

    authStorage.clear();

    setSession(null);

  }, []);



  useEffect(() => {

    const unregisterUnauthorized = registerUnauthorizedHandler(() => {

      setSession(null);

    });



    const unregisterStorage = registerAuthSessionListener((next) => {

      setSession(next);

    });



    async function bootstrap() {
      const stored = authStorage.get();

      if (!env.apiUrl) {
        setSession(stored);
        setIsInitializing(false);
        return;
      }

      if (!stored) {
        setIsInitializing(false);
        return;
      }

      try {
        let restored: AuthSession | null = null;

        if (isSystemUserSession(stored)) {
          restored = await withTimeout(
            restoreSystemUserSession(stored),
            BOOTSTRAP_TIMEOUT_MS,
            "Session restore timed out",
          );
        } else if (isEmpleadoSession(stored)) {
          restored = restoreEmpleadoSession(stored);
        }

        if (!restored || !resolveAppRole(restored)) {
          authStorage.clear();
          setSession(null);
        } else {
          setSession(restored);
        }
      } catch {
        authStorage.clear();
        setSession(null);
      } finally {
        setIsInitializing(false);
      }
    }



    void bootstrap();



    return () => {

      unregisterUnauthorized();

      unregisterStorage();

    };

  }, []);



  useEffect(() => {

    if (!session?.accessToken || !env.apiUrl || !isSystemUserSession(session)) {

      return;

    }



    const delayMs = getRefreshDelayMs(session.accessToken);

    if (delayMs === null) return;



    const timer = window.setTimeout(() => {

      void refreshAuthTokens();

    }, delayMs);



    return () => window.clearTimeout(timer);

  }, [session?.accessToken, session?.refreshToken, session?.actorType]);



  const appRole = session ? resolveAppRole(session) : null;



  const value = useMemo(

    () => ({

      session,

      isAuthenticated: session !== null && appRole !== null,

      isInitializing,

      appRole,

      login,

      logout,

    }),

    [session, isInitializing, appRole, login, logout],

  );



  return (

    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>

  );

}



export function useAuth() {

  const context = useContext(AuthContext);

  if (!context) {

    throw new Error("useAuth debe usarse dentro de AuthProvider");

  }

  return context;

}


