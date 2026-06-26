// ⚠️ AGNOSTIC — persisted JWT session (localStorage)

import type { AuthSession, AuthUser, EmpleadoProfile } from "./types/auth";

const STORAGE_KEY = "cerebiia_auth";

type SessionListener = (session: AuthSession | null) => void;

let sessionListener: SessionListener | null = null;

function isEmpleadoProfile(value: unknown): boolean {
  if (typeof value !== "object" || value === null) return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.id === "string" &&
    typeof record.documento === "string" &&
    typeof record.nombre === "string" &&
    typeof record.estado === "string"
  );
}

function isAuthUser(value: unknown): boolean {
  if (typeof value !== "object" || value === null) return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.id === "string" &&
    typeof record.email === "string" &&
    typeof record.role === "string"
  );
}

function isAuthSession(value: unknown): value is AuthSession {
  if (typeof value !== "object" || value === null) return false;
  const record = value as Record<string, unknown>;

  if (
    typeof record.accessToken !== "string" ||
    typeof record.refreshToken !== "string" ||
    typeof record.actorType !== "string"
  ) {
    return false;
  }

  if (record.actorType === "system_user") {
    return isAuthUser(record.user);
  }

  if (record.actorType === "empleado") {
    return isEmpleadoProfile(record.empleado);
  }

  return false;
}

function notify(session: AuthSession | null): void {
  sessionListener?.(session);
}

export function registerAuthSessionListener(listener: SessionListener): () => void {
  sessionListener = listener;
  return () => {
    if (sessionListener === listener) {
      sessionListener = null;
    }
  };
}

export const authStorage = {
  get(): AuthSession | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;

      const parsed: unknown = JSON.parse(raw);
      if (!isAuthSession(parsed)) {
        localStorage.removeItem(STORAGE_KEY);
        return null;
      }

      return parsed;
    } catch {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
  },

  set(session: AuthSession): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    notify(session);
  },

  updateTokens(accessToken: string, refreshToken: string): void {
    const current = this.get();
    if (!current) return;

    const next: AuthSession = {
      ...current,
      accessToken,
      refreshToken,
    };
    this.set(next);
  },

  updateSystemUser(user: AuthUser): void {
    const current = this.get();
    if (!current || current.actorType !== "system_user") return;

    this.set({ ...current, user });
  },

  updateEmpleado(empleado: EmpleadoProfile): void {
    const current = this.get();
    if (!current || current.actorType !== "empleado") return;

    this.set({ ...current, empleado });
  },

  clear(): void {
    localStorage.removeItem(STORAGE_KEY);
    notify(null);
  },
};
