import {
  mustChangePassword,
  resolveAppRole,
} from "@/shared/api/authMappers";
import type { AppUserRole, AuthSession } from "@/shared/api/types/auth";
import { ROUTES } from "./routes";

export function getHomeRouteForAppRole(role: AppUserRole): string {
  switch (role) {
    case "employee":
      return ROUTES.employee.dashboard;
    case "employer":
      return ROUTES.employer.panel;
  }
}

/**
 * Destino post-login / GuestGuard. Si la empresa debe cambiar la
 * contraseña por defecto, fuerza esa pantalla antes del panel.
 */
export function getPostLoginRoute(session: AuthSession): string {
  if (mustChangePassword(session)) {
    return ROUTES.employer.changePasswordRequired;
  }

  const role = resolveAppRole(session);
  if (!role) return ROUTES.login;
  return getHomeRouteForAppRole(role);
}

export function isAppRole(value: string | null | undefined): value is AppUserRole {
  return value === "employee" || value === "employer";
}
