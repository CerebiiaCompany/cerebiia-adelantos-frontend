import { ROUTES } from "@/shared/config/routes";

/**
 * Corrige hrefs legacy del backend que no coinciden con las rutas SPA actuales.
 * Las notificaciones ya persistidas no siempre se reescriben en sync (dedupe_key).
 */
const HREF_ALIASES: Record<string, string> = {
  "/empleador/empleados": ROUTES.employer.misEmpleados,
  "/empleador/historial": ROUTES.employer.historialMovimientos,
  "/soportes": ROUTES.employee.soportes,
};

/** Destino canónico por kind (empleado / empresa). Sobrescribe hrefs incorrectos. */
const KIND_CANONICAL_HREF: Record<string, string> = {
  // Empleado — adelantos → Mis adelantos (no /adelanto)
  advance_requested: ROUTES.employee.misAdelantos,
  advance_approved: ROUTES.employee.misAdelantos,
  advance_paid: ROUTES.employee.misAdelantos,
  advance_rejected: ROUTES.employee.misAdelantos,
  payment_evidence: ROUTES.employee.misAdelantos,
  // Empleado — otros módulos
  support_replied: ROUTES.employee.soportes,
  payroll_due_3d: ROUTES.employee.control,
  next_payment_net_updated: ROUTES.employee.control,
  cupo_80: ROUTES.employee.control,
  cupo_low: ROUTES.employee.control,
  cupo_exhausted: ROUTES.employee.control,
  // Empresa
  employee_activated: ROUTES.employer.misEmpleados,
  employee_suspended: ROUTES.employer.misEmpleados,
  employer_advance_requested: ROUTES.employer.historialMovimientos,
  employer_advance_approved: ROUTES.employer.historialMovimientos,
  employer_advance_rejected: ROUTES.employer.historialMovimientos,
  employer_support_message: ROUTES.employer.soportes,
  provider_week_debt: ROUTES.employer.retencionesCierres,
};

function resolveAuditHref(rawPath: string): string {
  if (rawPath.startsWith("/empleador")) {
    return ROUTES.employer.auditorias;
  }
  return ROUTES.employee.auditorias;
}

function resolveAchievementHref(raw: string): string {
  const hashIndex = raw.indexOf("#");
  const hash = hashIndex >= 0 ? raw.slice(hashIndex) : "";
  return `${ROUTES.employee.logros}${hash}`;
}

export function normalizeNotificationHref(
  href: string | null | undefined,
  kind?: string,
): string | undefined {
  const raw = (href ?? "").trim();
  const pathOnly = raw ? (raw.split(/[?#]/)[0] ?? raw) : "";

  if (kind === "achievement_unlocked") {
    return resolveAchievementHref(raw || ROUTES.employee.logros);
  }

  if (kind === "data_change_audit") {
    return resolveAuditHref(pathOnly || raw);
  }

  if (
    kind === "config_fee_updated" ||
    kind === "config_advance_percent_updated" ||
    kind === "config_min_amount_updated" ||
    kind === "config_installments_updated" ||
    kind === "config_custom_updated"
  ) {
    if (pathOnly.startsWith("/empleador")) {
      return ROUTES.employer.panel;
    }
    return ROUTES.employee.adelanto;
  }

  if (kind && KIND_CANONICAL_HREF[kind]) {
    return KIND_CANONICAL_HREF[kind];
  }

  if (raw) {
    const mapped = HREF_ALIASES[pathOnly] ?? HREF_ALIASES[raw];
    if (mapped) return mapped;
    // Legacy: /adelanto se usaba por error para estados de adelanto
    if (pathOnly === "/adelanto") {
      return ROUTES.employee.misAdelantos;
    }
    return raw;
  }

  return undefined;
}
