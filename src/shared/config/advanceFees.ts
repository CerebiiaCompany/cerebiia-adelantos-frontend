import { formatCOP } from "@/shared/lib/currency";

/** Tarifa por cuota usada en modo demo o cuando la API no responde (COP). */
export const DEFAULT_TARIFA_FIJA_POR_CUOTA = 8_000;

/** @deprecated Usar DEFAULT_TARIFA_FIJA_POR_CUOTA */
export const ADVANCE_TRANSACTION_FEE_AMOUNT = DEFAULT_TARIFA_FIJA_POR_CUOTA;

export type AdvanceFeeOptions = {
  /**
   * Empleado nuevo (sin adelantos previos distintos de rechazado):
   * 1 cuota → comisión 0; N cuotas → se cobran N-1 tarifas (todas menos la 1ª).
   */
  primeraCuotaGratis?: boolean;
};

/**
 * Comisión total a descontar del desembolso.
 * Coincide con el backend (`_calcular_tarifas_cuotas`).
 */
export function calculateAdvanceTotalFee(
  tarifaFijaPorCuota: number,
  numeroCuotas: number,
  amount: number,
  options?: AdvanceFeeOptions,
): number {
  if (amount <= 0 || numeroCuotas <= 0 || tarifaFijaPorCuota <= 0) {
    return 0;
  }

  if (options?.primeraCuotaGratis) {
    if (numeroCuotas === 1) return 0;
    return Math.round(tarifaFijaPorCuota * (numeroCuotas - 1));
  }

  return Math.round(tarifaFijaPorCuota * numeroCuotas);
}

export function calculateAdvanceNetAmount(
  amount: number,
  tarifaFijaPorCuota: number,
  numeroCuotas: number,
  options?: AdvanceFeeOptions,
): number {
  return (
    amount -
    calculateAdvanceTotalFee(tarifaFijaPorCuota, numeroCuotas, amount, options)
  );
}

/**
 * Tarifas por cuota (índice 0 = 1ª cuota), alineadas con el plan del backend.
 */
export function buildAdvanceFeeSchedule(
  tarifaFijaPorCuota: number,
  numeroCuotas: number,
  options?: AdvanceFeeOptions,
): number[] {
  const n = Math.max(1, Math.round(numeroCuotas));
  const tarifa = Math.round(tarifaFijaPorCuota);

  if (tarifa <= 0 || n < 1) {
    return Array.from({ length: n }, () => 0);
  }

  if (!options?.primeraCuotaGratis) {
    return Array.from({ length: n }, () => tarifa);
  }

  // Primera gratis: [0, tarifa, tarifa, ...]
  return Array.from({ length: n }, (_, index) => (index === 0 ? 0 : tarifa));
}

/**
 * Comisión informativa de la cuota `installmentIndex` (0-based) en retenciones.
 *
 * Promo (primera cuota gratis): feeTotal = tarifa × (N-1) → índice 0 gratis,
 * índices 1..N-1 pagan la tarifa. Plan estándar: cada cuota paga la tarifa fija.
 */
export function calculateFeeForInstallmentIndex(
  feeTotal: number,
  numeroCuotas: number,
  installmentIndex: number,
  tarifaFijaPorCuota: number = DEFAULT_TARIFA_FIJA_POR_CUOTA,
): number {
  const n = Math.max(1, Math.round(numeroCuotas));
  const total = Math.round(feeTotal);
  if (total <= 0 || installmentIndex < 0 || installmentIndex >= n) {
    return 0;
  }

  const tarifa = Math.round(tarifaFijaPorCuota);
  const fullFee = tarifa > 0 ? tarifa * n : 0;
  const promoFee = tarifa > 0 && n > 1 ? tarifa * (n - 1) : 0;

  // Promo: 1ª gratis, resto con tarifa.
  if (tarifa > 0 && total === promoFee && promoFee < fullFee) {
    return installmentIndex === 0 ? 0 : tarifa;
  }

  if (tarifa > 0 && total === fullFee) {
    return tarifa;
  }

  // Fallback: reparte de forma uniforme si no encaja con snapshots conocidos.
  return Math.round(total / n);
}

export function formatAdvanceTransactionFeeLabel(
  tarifaFijaPorCuota: number = DEFAULT_TARIFA_FIJA_POR_CUOTA,
  options?: { primeraCuotaGratis?: boolean; numeroCuotas?: number },
): string {
  if (options?.primeraCuotaGratis) {
    if ((options.numeroCuotas ?? 1) === 1) {
      return "Comisión por cuota (primera cuota gratis)";
    }
    return `Comisión (${formatCOP(tarifaFijaPorCuota)} · 1ª cuota gratis)`;
  }
  return `Comisión fija (${formatCOP(tarifaFijaPorCuota)} por cuota)`;
}

/** @deprecated Usar calculateAdvanceTotalFee con tarifa y cuotas desde configuración */
export function calculateAdvanceTransactionFee(
  amount: number,
  numeroCuotas = 1,
  tarifaFijaPorCuota = DEFAULT_TARIFA_FIJA_POR_CUOTA,
  options?: AdvanceFeeOptions,
): number {
  return calculateAdvanceTotalFee(
    tarifaFijaPorCuota,
    numeroCuotas,
    amount,
    options,
  );
}
