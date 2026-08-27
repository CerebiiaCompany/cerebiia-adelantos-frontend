import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
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
  normalizeAuthUser,
  normalizeEmpleadoProfile,
} from "@/shared/api";
import { isEmpleadoLocallyDeactivated } from "@/entities/empleado";
import type { AppUserRole, AuthSession } from "@/shared/api/types/auth";
import { env } from "@/shared/config/env";
import { withTimeout } from "@/shared/utils/withTimeout";
import { toast } from "sonner";

const BOOTSTRAP_TIMEOUT_MS = 10_000;
/** Límite de inactividad continua antes de cerrar sesión (15 minutos) */
const INACTIVITY_TIMEOUT_MS = 15 * 60 * 1000;

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
  if (current.user?.email && current.user?.role) {
    return current;
  }

  try {
    const user = normalizeAuthUser(await authEndpoints.me());
    const session = { ...current, user };
    authStorage.set(session);
    return session;
  } catch {
    const refreshed = await refreshAuthTokens();
    if (!refreshed) return null;

    try {
      const user = normalizeAuthUser(await authEndpoints.me());
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

async function restoreEmpleadoSession(
  stored: AuthSession & { actorType: "empleado" },
): Promise<AuthSession | null> {
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

  let current = stored;

  if (isAccessTokenExpired(current.accessToken)) {
    const refreshed = await refreshAuthTokens();
    if (!refreshed) return null;

    const latest = authStorage.get();
    if (!latest || !isEmpleadoSession(latest)) return null;
    current = latest;
  }

  return {
    ...current,
    empleado: normalizeEmpleadoProfile(current.empleado),
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const lastActivityTimeRef = useRef<number>(Date.now());

  const login = useCallback((next: AuthSession) => {
    lastActivityTimeRef.current = Date.now();
    authStorage.set(next);
    setSession(next);
  }, []);

  const logout = useCallback(() => {
    authStorage.clear();
    setSession(null);
  }, []);

  // 1. Detección de actividad del usuario (mouse, teclado, touch, scroll, clicks)
  useEffect(() => {
    if (!session) return;

    let lastThrottled = Date.now();
    const registerUserActivity = () => {
      const now = Date.now();
      if (now - lastThrottled > 2000) {
        lastThrottled = now;
        lastActivityTimeRef.current = now;
      }
    };

    window.addEventListener("mousemove", registerUserActivity, { passive: true });
    window.addEventListener("mousedown", registerUserActivity, { passive: true });
    window.addEventListener("keydown", registerUserActivity, { passive: true });
    window.addEventListener("touchstart", registerUserActivity, { passive: true });
    window.addEventListener("scroll", registerUserActivity, { passive: true });
    window.addEventListener("click", registerUserActivity, { passive: true });

    return () => {
      window.removeEventListener("mousemove", registerUserActivity);
      window.removeEventListener("mousedown", registerUserActivity);
      window.removeEventListener("keydown", registerUserActivity);
      window.removeEventListener("touchstart", registerUserActivity);
      window.removeEventListener("scroll", registerUserActivity);
      window.removeEventListener("click", registerUserActivity);
    };
  }, [session]);

  // 2. Verificación periódica de inactividad de 15 minutos
  useEffect(() => {
    if (!session) return;

    const checkInactivity = () => {
      const elapsed = Date.now() - lastActivityTimeRef.current;
      if (elapsed >= INACTIVITY_TIMEOUT_MS) {
        toast.error("Tu sesión ha expirado por 15 minutos de inactividad.");
        logout();
      }
    };

    const interval = window.setInterval(checkInactivity, 15_000);
    return () => window.clearInterval(interval);
  }, [session, logout]);

  // 3. Bootstrap inicial de la sesión
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
          restored = await withTimeout(
            restoreEmpleadoSession(stored),
            BOOTSTRAP_TIMEOUT_MS,
            "Session restore timed out",
          );
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

  // 4. Renovación automática proactiva de tokens (para empleado y system_user mientras esté activo)
  useEffect(() => {
    if (!session?.accessToken || !env.apiUrl) {
      return;
    }

    const delayMs = getRefreshDelayMs(session.accessToken);
    if (delayMs === null) return;

    const timer = window.setTimeout(async () => {
      const elapsed = Date.now() - lastActivityTimeRef.current;
      // Si el usuario ha estado activo en los últimos 15 minutos, renueva el token
      if (elapsed < INACTIVITY_TIMEOUT_MS) {
        await refreshAuthTokens();
      } else {
        toast.error("Tu sesión ha expirado por 15 minutos de inactividad.");
        logout();
      }
    }, delayMs);

    return () => window.clearTimeout(timer);
  }, [session?.accessToken, session?.refreshToken, session?.actorType, logout]);

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
