// ⚠️ AGNOSTIC — maps backend auth payloads to frontend session

import { ApiError } from "./errors";
import type {
  AppUserRole,
  AuthSession,
  AuthUser,
  EmpleadoApiProfile,
  EmpleadoLoginResponse,
  EmpleadoProfile,
  EmpleadoSession,
  SystemUserLoginResponse,
  SystemUserSession,
} from "./types/auth";

export function isSystemUserSession(
  session: AuthSession,
): session is SystemUserSession {
  return session.actorType === "system_user";
}

export function isEmpleadoSession(session: AuthSession): session is EmpleadoSession {
  return session.actorType === "empleado";
}

export function assertSystemLoginAllowed(user: AuthUser): void {
  if (user.role === "super_admin") {
    throw new ApiError(403, "/auth/login/", {
      detail:
        "El panel de administración no está disponible en esta aplicación.",
    });
  }

  if (user.role !== "empresa") {
    throw new ApiError(403, "/auth/login/", {
      detail: "Usa el acceso de empleado con tu número de documento.",
    });
  }

  if (!user.is_active) {
    throw new ApiError(403, "/auth/login/", {
      detail: "La cuenta de empresa está inactiva.",
    });
  }
}

export function assertEmpleadoLoginAllowed(
  response: EmpleadoLoginResponse,
): void {
  if (response.empleado.estado === "inactivo") {
    throw new ApiError(403, "/empleados/login/", {
      detail:
        "Tu cuenta ha sido suspendida por la empresa. Contacta a Recursos Humanos.",
    });
  }

  if (response.empleado.estado !== "activo") {
    throw new ApiError(403, "/empleados/login/", {
      detail:
        "Tu cuenta aún no está activa. Completa la activación antes de iniciar sesión.",
    });
  }
}

export function normalizeEmpleadoProfile(
  empleado: EmpleadoApiProfile,
): EmpleadoProfile {
  const bankName = empleado.banco?.trim() || empleado.banco_nombre?.trim() || "";

  return {
    id: empleado.id,
    documento: empleado.documento,
    nombre: empleado.nombre,
    salario: empleado.salario,
    banco: bankName || undefined,
    banco_nombre: empleado.banco_nombre,
    numero_cuenta: empleado.numero_cuenta,
    tipo_cuenta: empleado.tipo_cuenta,
    fecha_ingreso: empleado.fecha_ingreso,
    email_empleado: empleado.email_empleado,
    celular: empleado.celular,
    estado: empleado.estado,
    empresa_id: empleado.empresa_id,
    created_at: empleado.created_at,
    updated_at: empleado.updated_at,
  };
}

export function mapSystemLoginResponseToSession(
  response: SystemUserLoginResponse,
): SystemUserSession {
  assertSystemLoginAllowed(response.user);

  return {
    actorType: "system_user",
    accessToken: response.tokens.access,
    refreshToken: response.tokens.refresh,
    user: response.user,
  };
}

export function mapEmpleadoLoginResponseToSession(
  response: EmpleadoLoginResponse,
): EmpleadoSession {
  assertEmpleadoLoginAllowed(response);

  return {
    actorType: "empleado",
    accessToken: response.tokens.access,
    refreshToken: response.tokens.refresh,
    empleado: normalizeEmpleadoProfile(response.empleado),
  };
}

export function resolveAppRole(session: AuthSession): AppUserRole | null {
  if (isEmpleadoSession(session)) {
    return session.empleado.estado === "activo" ? "employee" : null;
  }

  if (!session.user.is_active || session.user.role !== "empresa") {
    return null;
  }

  return "employer";
}

export function buildDemoEmpleadoSession(): EmpleadoSession {
  return {
    actorType: "empleado",
    accessToken: "demo-access-token",
    refreshToken: "demo-refresh-token",
    empleado: {
      id: "demo-empleado",
      documento: "1020304050",
      nombre: "Usuario Demo",
      salario: "2400000.00",
      banco: "Bancolombia",
      numero_cuenta: "123456789",
      tipo_cuenta: "ahorros",
      fecha_ingreso: "2025-01-15",
      estado: "activo",
      empresa_id: "demo-empresa",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  };
}

/** @deprecated Use mapSystemLoginResponseToSession */
export function mapLoginResponseToSession(
  response: SystemUserLoginResponse,
): SystemUserSession {
  return mapSystemLoginResponseToSession(response);
}

/** @deprecated Use buildDemoEmpleadoSession */
export function buildDemoAuthSession(): EmpleadoSession {
  return buildDemoEmpleadoSession();
}
