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
  const salary = parseDecimalAmount(nomina.salario) ?? 0;
  const parsedPercentage = Number.parseFloat(nomina.porcentaje_maximo_adelanto);
  const advancePercentage =
    !Number.isNaN(parsedPercentage) && parsedPercentage > 0
      ? parsedPercentage
      : 30;

  const rawMax = parseDecimalAmount(nomina.monto_maximo_adelanto);
  const maxAdvanceLimit =
    rawMax !== undefined && rawMax > 0
      ? rawMax
      : salary > 0
        ? Math.round(salary * (advancePercentage / 100))
        : 0;

  const saldoDisponible = parseDecimalAmount(nomina.saldo_disponible);
  const calculatedAvailable = Math.max(0, maxAdvanceLimit - totalAdvancedThisMonth);

  let availableAdvance: number;
  if (saldoDisponible !== undefined) {
    if (totalAdvancedThisMonth === 0 && saldoDisponible < maxAdvanceLimit) {
      availableAdvance = maxAdvanceLimit;
    } else {
      availableAdvance = Math.min(saldoDisponible, maxAdvanceLimit);
    }
  } else {
    availableAdvance = calculatedAvailable;
  }

  if (maxAdvanceLimit > 0) {
    availableAdvance = Math.min(availableAdvance, maxAdvanceLimit);
  }

  return {
    maxAdvanceLimit,
    availableAdvance,
    advancePercentage,
  };
}

