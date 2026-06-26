// ⚠️ AGNOSTIC — límites de adelanto desde GET /empleados/me/

import type { EmpleadoMeDTO } from "@/shared/api/types/adelanto";

export type EmployeeAdvanceLimits = {
  maxAdvanceLimit: number;
  availableAdvance: number;
  advancePercentage: number;
};

function parseDecimalAmount(value?: string): number | undefined {
  if (!value?.trim()) return undefined;
  const amount = Number.parseFloat(value);
  if (Number.isNaN(amount)) return undefined;
  return Math.round(amount);
}

/**
 * Fuente de verdad: nómina del empleado (porcentaje global del super admin).
 * `saldo_disponible` ya descuenta solicitudes activas en el backend.
 */
export function resolveAdvanceLimitsFromNomina(
  nomina: EmpleadoMeDTO,
  totalAdvancedThisMonth = 0,
): EmployeeAdvanceLimits {
  const maxAdvanceLimit =
    parseDecimalAmount(nomina.monto_maximo_adelanto) ?? 0;
  const saldoDisponible = parseDecimalAmount(nomina.saldo_disponible);
  let availableAdvance =
    saldoDisponible !== undefined
      ? saldoDisponible
      : Math.max(0, maxAdvanceLimit - totalAdvancedThisMonth);

  if (maxAdvanceLimit > 0) {
    availableAdvance = Math.min(availableAdvance, maxAdvanceLimit);
  }

  const parsedPercentage = Number.parseFloat(nomina.porcentaje_maximo_adelanto);
  const advancePercentage = Number.isNaN(parsedPercentage)
    ? 0
    : parsedPercentage;

  return {
    maxAdvanceLimit,
    availableAdvance,
    advancePercentage,
  };
}
