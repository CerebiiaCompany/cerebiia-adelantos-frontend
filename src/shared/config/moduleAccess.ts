import type { AppUserRole } from "@/shared/api/types/auth";
import { ROUTES } from "./routes";

export type EmployeeModuleId =
  | "employee.dashboard"
  | "employee.adelanto"
  | "employee.misAdelantos"
  | "employee.wallet"
  | "employee.control"
  | "employee.asistente"
  | "employee.logros"
  | "employee.notificaciones";

export type EmployerModuleId = "employer.dashboard" | "employer.misEmpleados";

export type AppModuleId = EmployeeModuleId | EmployerModuleId;

type ModuleDefinition = {
  path: string;
  roles: AppUserRole[];
  end?: boolean;
};

export const APP_MODULES: Record<AppModuleId, ModuleDefinition> = {
  "employee.dashboard": {
    path: ROUTES.employee.dashboard,
    roles: ["employee"],
    end: true,
  },
  "employee.adelanto": {
    path: ROUTES.employee.adelanto,
    roles: ["employee"],
  },
  "employee.misAdelantos": {
    path: ROUTES.employee.misAdelantos,
    roles: ["employee"],
  },
  "employee.wallet": {
    path: ROUTES.employee.wallet,
    roles: ["employee"],
  },
  "employee.control": {
    path: ROUTES.employee.control,
    roles: ["employee"],
  },
  "employee.asistente": {
    path: ROUTES.employee.asistente,
    roles: ["employee"],
  },
  "employee.logros": {
    path: ROUTES.employee.logros,
    roles: ["employee"],
  },
  "employee.notificaciones": {
    path: ROUTES.employee.notificaciones,
    roles: ["employee"],
  },
  "employer.dashboard": {
    path: ROUTES.employer.panel,
    roles: ["employer"],
    end: true,
  },
  "employer.misEmpleados": {
    path: ROUTES.employer.misEmpleados,
    roles: ["employer"],
  },
};

const EMPLOYEE_MODULE_IDS = Object.keys(APP_MODULES).filter((id) =>
  id.startsWith("employee."),
) as EmployeeModuleId[];

const EMPLOYER_MODULE_IDS = Object.keys(APP_MODULES).filter((id) =>
  id.startsWith("employer."),
) as EmployerModuleId[];

export function canAccessModule(
  appRole: AppUserRole | null,
  moduleId: AppModuleId,
): boolean {
  if (!appRole) return false;
  return APP_MODULES[moduleId].roles.includes(appRole);
}

export function getModulesForRole(appRole: AppUserRole): AppModuleId[] {
  if (appRole === "employee") return EMPLOYEE_MODULE_IDS;
  return EMPLOYER_MODULE_IDS;
}

export function canAccessPath(
  appRole: AppUserRole | null,
  pathname: string,
): boolean {
  if (!appRole) return false;

  return Object.values(APP_MODULES).some((module) => {
    if (!module.roles.includes(appRole)) return false;

    if (module.end) {
      return pathname === module.path;
    }

    return (
      pathname === module.path || pathname.startsWith(`${module.path}/`)
    );
  });
}

export function resolveModuleIdFromPath(
  pathname: string,
): AppModuleId | null {
  const match = (Object.entries(APP_MODULES) as [AppModuleId, ModuleDefinition][])
    .filter(([, module]) => {
      if (module.end) return pathname === module.path;
      return (
        pathname === module.path || pathname.startsWith(`${module.path}/`)
      );
    })
    .sort(([, a], [, b]) => b.path.length - a.path.length)[0];

  return match?.[0] ?? null;
}
