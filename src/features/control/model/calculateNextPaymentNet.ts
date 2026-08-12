import {
  getAdvanceMonthKey,
} from "@/entities/employee-dashboard";
import type { AdvanceHistoryRecord } from "@/shared/config/advanceHistory.types";

function monthKeyDiff(fromKey: string, toKey: string): number {
  const [fromYear, fromMonth] = fromKey.split("-").map(Number);
  const [toYear, toMonth] = toKey.split("-").map(Number);
  return (toYear - fromYear) * 12 + (toMonth - fromMonth);
}

/**
 * Adelantos que generan descuento en nómina (alineado con retenciones empresa).
 * Solo aprobados/pagados — no en curso ni rechazados.
 */
function isPayrollDeductible(status: AdvanceHistoryRecord["status"]): boolean {
  return status === "aprobado";
}

/**
 * Monto de capital a descontar este mes por cuotas (misma lógica que
 * retenciones del panel empresa). No incluye comisión.
 */
export function calculateCurrentMonthPayrollDeduction(
  records: AdvanceHistoryRecord[],
  referenceDate: Date = new Date(),
): number {
  const monthKey = getAdvanceMonthKey(referenceDate);
  let total = 0;

  for (const record of records) {
    if (!isPayrollDeductible(record.status)) continue;

    const requestKey = getAdvanceMonthKey(record.requestedAt);
    const offset = monthKeyDiff(requestKey, monthKey);
    if (offset < 0) continue;

    const planMonths = Math.max(1, record.installments || 1);
    if (offset >= planMonths) continue;

    if (planMonths === 1) {
      total += record.amount;
    } else {
      total += Math.round(record.amount / planMonths);
    }
  }

  return total;
}

/** Salario mensual menos descuentos de adelantos/cuotas del mes. */
export function calculateNextPaymentNet(
  salary: number,
  payrollDeductionThisMonth: number,
): number {
  return Math.max(0, salary - payrollDeductionThisMonth);
}
