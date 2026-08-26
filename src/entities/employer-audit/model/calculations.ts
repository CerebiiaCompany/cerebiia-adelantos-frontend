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

export interface CuotaLike {
  id?: string;
  numero?: number;
  monto?: number | string;
  tarifa_cuota?: number | string;
  fecha_corte?: string; // "YYYY-MM-DD"
  estado?: string;
  fecha_pago?: string | null;
}

export function isCuotaPagada(cuota: CuotaLike): boolean {
  const estado = String(cuota.estado || "").toLowerCase().trim();
  return (
    estado === "pagado" ||
    estado === "pagada" ||
    estado === "liberado" ||
    estado === "liberada" ||
    Boolean(cuota.fecha_pago)
  );
}

export interface EstadoSeguimientoCuotasResult {
  cuotasPagadas: number;
  totalCuotas: number;
  pendingInstallments: number;
  saldoPorDescontar: number;
  installmentValue: number;
  estadoCuotaMes: "al_dia" | "pendiente" | "completado";
  isFullyPaid: boolean;
}

/**
 * Calcula el estado de seguimiento de cuotas multi-mes para el panel de empresa.
 * - Total cuotas y pagadas (X de Y, N restantes)
 * - Saldo por descontar (suma de cuotas pendientes)
 * - Estado cuota del mes: 'al_dia', 'pendiente' o 'completado'
 */
export function calcularEstadoSeguimiento(
  cuotas: CuotaLike[] | undefined,
  totalLoanAmount: number,
  totalInstallments: number,
  solicitudStatus?: string,
  referenceDate: Date = new Date(),
): EstadoSeguimientoCuotasResult {
  const safeTotalInstallments = Math.max(1, totalInstallments);
  const installmentValue = Math.round(totalLoanAmount / safeTotalInstallments);

  if (Array.isArray(cuotas) && cuotas.length > 0) {
    const totalCuotas = cuotas.length;
    const cuotasPagadas = cuotas.filter(isCuotaPagada).length;
    const isFullyPaid = cuotasPagadas >= totalCuotas;
    const pendingInstallments = Math.max(0, totalCuotas - cuotasPagadas);
    const saldoPorDescontar = isFullyPaid
      ? 0
      : cuotas
          .filter((c) => !isCuotaPagada(c))
          .reduce(
            (acc, c) =>
              acc +
              (typeof c.monto === "number"
                ? c.monto
                : Number.parseFloat(String(c.monto)) || installmentValue),
            0,
          );

    const anioActual = referenceDate.getFullYear();
    const mesActual = referenceDate.getMonth() + 1; // 1-12

    const cuotaMesActual = cuotas.find((c) => {
      if (!c.fecha_corte) return false;
      const [a, m] = c.fecha_corte.split("-").map(Number);
      return a === anioActual && m === mesActual;
    });

    let estadoCuotaMes: "al_dia" | "pendiente" | "completado" = "al_dia";
    if (isFullyPaid) {
      estadoCuotaMes = "completado";
    } else if (cuotaMesActual) {
      estadoCuotaMes = isCuotaPagada(cuotaMesActual) ? "al_dia" : "pendiente";
    } else {
      const hayVencidasPendientes = cuotas.some((c) => {
        if (!c.fecha_corte) return false;
        const [a, m] = c.fecha_corte.split("-").map(Number);
        const fechaCuota = new Date(a, m - 1, 1);
        const fechaMesActual = new Date(anioActual, mesActual - 1, 1);
        return fechaCuota <= fechaMesActual && !isCuotaPagada(c);
      });
      estadoCuotaMes = hayVencidasPendientes ? "pendiente" : "al_dia";
    }

    return {
      cuotasPagadas,
      totalCuotas,
      pendingInstallments,
      saldoPorDescontar,
      installmentValue,
      estadoCuotaMes,
      isFullyPaid,
    };
  }

  // Fallback cuando no hay desglose individual de cuotas
  const isPaid =
    solicitudStatus === "pagado" ||
    solicitudStatus === "procesado";
  const cuotasPagadas = isPaid ? 1 : 0;
  const isFullyPaid = cuotasPagadas >= safeTotalInstallments;
  const pendingInstallments = Math.max(0, safeTotalInstallments - cuotasPagadas);
  const saldoPorDescontar = isFullyPaid
    ? 0
    : Math.max(0, totalLoanAmount - installmentValue * cuotasPagadas);
  const estadoCuotaMes: "al_dia" | "pendiente" | "completado" = isFullyPaid
    ? "completado"
    : isPaid
      ? "al_dia"
      : "pendiente";

  return {
    cuotasPagadas,
    totalCuotas: safeTotalInstallments,
    pendingInstallments,
    saldoPorDescontar,
    installmentValue,
    estadoCuotaMes,
    isFullyPaid,
  };
}
