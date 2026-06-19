import type { AppUserRole } from "@/shared/api/types/auth";
import { ROUTES } from "./routes";

export function getHomeRouteForAppRole(role: AppUserRole): string {
  switch (role) {
    case "employee":
      return ROUTES.employee.dashboard;
    case "employer":
      return ROUTES.employer.panel;
  }
}

export function isAppRole(value: string | null | undefined): value is AppUserRole {
  return value === "employee" || value === "employer";
}
