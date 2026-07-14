// ⚠️ AGNOSTIC — employer audit business rules

import {
  DEFAULT_TARIFA_FIJA_POR_CUOTA,
  calculateAdvanceTotalFee,
} from "@/shared/config/advanceFees";
import type { CompanyAdvanceStatus } from "./registryStorage";

/** @deprecated Preferir tarifa desde GET /configuracion/ */
export const ADVANCE_FEE_AMOUNT = DEFAULT_TARIFA_FIJA_POR_CUOTA;
export const ADVANCE_SALARY_CAP_RATIO = 0.3;

/**
 * Fallback cuando la solicitud no trae tarifa_total.
 * Preferir siempre el snapshot/API (`feeAmount` / `tarifa_total`).
 */
export function calculateAdvanceFee(
  amount: number,
  tarifaFijaPorCuota: number = DEFAULT_TARIFA_FIJA_POR_CUOTA,
  numeroCuotas = 1,
): number {
  return calculateAdvanceTotalFee(tarifaFijaPorCuota, numeroCuotas, amount);
}

/**
 * Adelantos que generan descuento en nómina / seguimiento de cuotas /
 * reembolso al proveedor: aprobados o pagados (UI: procesado).
 * Rechazados y en curso NO entran al consolidado.
 */
export function isRecoverableCompanyAdvance(
  status: CompanyAdvanceStatus,
): boolean {
  return status === "procesado";
}

/**
 * Total a descontar en nómina por fila de monitoreo.
 * Rechazado → $0 (no hay retención).
 */
export function calculateTotalWithholding(
  amount: number,
  status?: CompanyAdvanceStatus,
): number {
  if (status === "rechazado") return 0;
  return amount;
}

export function calculateSalaryPercentage(
  amount: number,
  baseSalary: number,
): number {
  if (baseSalary <= 0) return 0;
  return (amount / baseSalary) * 100;
}

export function exceedsSalaryCap(amount: number, baseSalary: number): boolean {
  return (
    calculateSalaryPercentage(amount, baseSalary) >
    ADVANCE_SALARY_CAP_RATIO * 100
  );
}
