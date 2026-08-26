// ⚠️ AGNOSTIC — límites de adelanto desde GET /empleados/me/

import type { EmpleadoMeDTO } from "@/shared/api/types/adelanto";

export type EmployeeAdvanceLimits = {
  maxAdvanceLimit: number;
  availableAdvance: number;
  advancePercentage: number;
};

function parseDecimalAmount(value?: unknown): number | undefined {
  if (value === undefined || value === null) return undefined;
  if (typeof value === "number") {
    return Number.isFinite(value) ? Math.round(value) : undefined;
  }
  if (typeof value === "string") {
    const cleaned = value.trim();
    if (!cleaned) return undefined;
    const amount = Number.parseFloat(cleaned);
    if (Number.isNaN(amount) || !Number.isFinite(amount)) return undefined;
    return Math.round(amount);
  }
  return undefined;
}

/**
 * Fuente de verdad: nómina del empleado (porcentaje global del super admin).
 * `saldo_disponible` ya descuenta solicitudes activas y suma liberaciones en el backend.
 */
export function resolveAdvanceLimitsFromNomina(
  nomina: EmpleadoMeDTO,
  totalAdvancedThisMonth = 0,
): EmployeeAdvanceLimits {
  const salary = parseDecimalAmount(nomina.salario) ?? 0;
  const parsedPercentage = Number.parseFloat(
    String(nomina.porcentaje_maximo_adelanto ?? "30"),
  );
  const advancePercentage =
    !Number.isNaN(parsedPercentage) && parsedPercentage > 0
      ? parsedPercentage
      : 30;

  const rawMax = parseDecimalAmount(
    nomina.monto_maximo_adelanto ??
      (nomina as Record<string, unknown>).montoMaximoAdelanto ??
      (nomina as Record<string, unknown>).cupo_maximo,
  );
  let maxAdvanceLimit =
    rawMax !== undefined && rawMax > 0
      ? rawMax
      : salary > 0
        ? Math.round(salary * (advancePercentage / 100))
        : 0;

  const rawSaldo =
    nomina.saldo_disponible ??
    (nomina as Record<string, unknown>).saldoDisponible ??
    (nomina as Record<string, unknown>).cupo_disponible ??
    (nomina as Record<string, unknown>).cupoDisponible ??
    (nomina as Record<string, unknown>).monto_disponible;

  const saldoDisponible = parseDecimalAmount(rawSaldo);
  const calculatedAvailable = Math.max(0, maxAdvanceLimit - totalAdvancedThisMonth);

  let availableAdvance: number;
  if (saldoDisponible !== undefined) {
    availableAdvance = Math.max(0, saldoDisponible);
    // Si el backend liberó o asignó un saldo mayor al tope base, adaptar el tope máximo
    if (availableAdvance > maxAdvanceLimit) {
      maxAdvanceLimit = availableAdvance;
    }
  } else {
    availableAdvance = Math.max(0, Math.min(calculatedAvailable, maxAdvanceLimit));
  }

  return {
    maxAdvanceLimit,
    availableAdvance,
    advancePercentage,
  };
}

