// ⚠️ AGNOSTIC — fechas de corte de cuotas alineadas al mes de la solicitud

import {
  PAYMENT_DAYS_OF_MONTH,
  resolvePaymentDayInMonth,
} from "@/shared/config/payrollCalendar";

/**
 * Día de corte / descuento en nómina (fin de periodo).
 * Coincide con el pago mensual del día 30 del calendario de nómina.
 */
export const INSTALLMENT_CUTOFF_DAY =
  PAYMENT_DAYS_OF_MONTH[PAYMENT_DAYS_OF_MONTH.length - 1];

/** Formato YYYY-MM-DD en calendario local (sin UTC shift). */
export function formatIsoDateLocal(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Calcula las fechas de corte de cuotas.
 * La cuota 1 cae en el pago del **mismo mes** de la solicitud;
 * las siguientes en los meses consecutivos.
 *
 * Ej.: solicitud 14-jul-2026, 2 cuotas → 30-jul-2026, 30-ago-2026.
 */
export function buildInstallmentCutoffDates(
  requestedAt: Date | string,
  numeroCuotas: number,
): Date[] {
  const requestDate =
    typeof requestedAt === "string" ? new Date(requestedAt) : requestedAt;

  if (Number.isNaN(requestDate.getTime()) || numeroCuotas <= 0) {
    return [];
  }

  const year = requestDate.getFullYear();
  const month = requestDate.getMonth();

  return Array.from({ length: numeroCuotas }, (_, index) =>
    resolvePaymentDayInMonth(year, month + index, INSTALLMENT_CUTOFF_DAY),
  );
}

/** Fecha de corte mostrada para la cuota N (1-based), según mes de solicitud. */
export function resolveInstallmentCutoffDate(
  requestedAt: Date | string,
  cuotaNumero: number,
  totalCuotas?: number,
): Date | null {
  const count = Math.max(totalCuotas ?? cuotaNumero, cuotaNumero);
  const dates = buildInstallmentCutoffDates(requestedAt, count);
  return dates[cuotaNumero - 1] ?? null;
}

export function resolveInstallmentCutoffIso(
  requestedAt: Date | string,
  cuotaNumero: number,
  totalCuotas?: number,
  fallbackIso?: string,
): string {
  const date = resolveInstallmentCutoffDate(
    requestedAt,
    cuotaNumero,
    totalCuotas,
  );
  if (date) return formatIsoDateLocal(date);
  return fallbackIso ?? "";
}
