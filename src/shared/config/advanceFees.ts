import { formatCOP } from "@/shared/lib/currency";

/** Tarifa por cuota usada en modo demo o cuando la API no responde (COP). */
export const DEFAULT_TARIFA_FIJA_POR_CUOTA = 8_000;

/** @deprecated Usar DEFAULT_TARIFA_FIJA_POR_CUOTA */
export const ADVANCE_TRANSACTION_FEE_AMOUNT = DEFAULT_TARIFA_FIJA_POR_CUOTA;

/**
 * Comisión total = tarifa fija por cuota × número de cuotas.
 * Coincide con el backend: tarifa_total = tarifa_fija_por_cuota × numero_cuotas.
 */
export function calculateAdvanceTotalFee(
  tarifaFijaPorCuota: number,
  numeroCuotas: number,
  amount: number,
): number {
  if (amount <= 0 || numeroCuotas <= 0 || tarifaFijaPorCuota <= 0) {
    return 0;
  }

  return Math.round(tarifaFijaPorCuota * numeroCuotas);
}

export function calculateAdvanceNetAmount(
  amount: number,
  tarifaFijaPorCuota: number,
  numeroCuotas: number,
): number {
  return amount - calculateAdvanceTotalFee(tarifaFijaPorCuota, numeroCuotas, amount);
}

export function formatAdvanceTransactionFeeLabel(
  tarifaFijaPorCuota: number = DEFAULT_TARIFA_FIJA_POR_CUOTA,
): string {
  return `Comisión fija (${formatCOP(tarifaFijaPorCuota)} por cuota)`;
}

/** @deprecated Usar calculateAdvanceTotalFee con tarifa y cuotas desde configuración */
export function calculateAdvanceTransactionFee(
  amount: number,
  numeroCuotas = 1,
  tarifaFijaPorCuota = DEFAULT_TARIFA_FIJA_POR_CUOTA,
): number {
  return calculateAdvanceTotalFee(tarifaFijaPorCuota, numeroCuotas, amount);
}
