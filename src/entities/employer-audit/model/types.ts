// ⚠️ AGNOSTIC — employer audit & payroll transparency records

export type EmployerAdvanceAuditStatus = "procesado" | "en_curso" | "rechazado";

export interface EmployerAdvanceAuditRecord {
  id: string;
  employeeName: string;
  employeeDocument: string;
  baseSalary: number;
  advancedAmount: number;
  /** Comisión/tarifa total de la solicitud (desde API, no inventada). */
  feeAmount: number;
  installments: number;
  status: EmployerAdvanceAuditStatus;
  processedAt: string;
}

export type EmployerLoanInstallmentStatus =
  | "al_dia"
  | "pendiente"
  | "vencida"
  | "pagada";

export interface EmployerLoanInstallmentRecord {
  id: string;
  employeeName: string;
  totalLoanAmount: number;
  totalInstallments: number;
  paidInstallments: number;
  installmentValue: number;
  pendingBalance: number;
  currentMonthStatus: EmployerLoanInstallmentStatus;
}

export type EmployerMovementType = "adelanto" | "cuota";

export interface EmployerMovementRecord {
  id: string;
  transferId: string;
  occurredAt: string;
  type: EmployerMovementType;
  status: EmployerAdvanceAuditStatus;
  /** Cantidad de cuotas de la solicitud. */
  installments: number;
  netDisbursedAmount: number;
  employeeName: string;
  paymentEvidenceUrl: string | null;
  rejectionReason: string | null;
}

export interface EmployerPayrollDeductionSummary {
  employeeName: string;
  employeeDocument: string;
  /** Cantidad de adelantos recuperables del mes. */
  advancesCount: number;
  /**
   * Plan de cuotas homogéneo del mes (null si hay planes distintos
   * entre adelantos del mismo empleado).
   */
  installments: number | null;
  /**
   * Valor de cada cuota cuando el plan es multi-cuota y homogéneo
   * (null si es 1 cuota, planes mixtos o montos distintos).
   */
  installmentValue: number | null;
  /**
   * Etiqueta de progreso de cuota(s) del mes, p.ej. "1 de 2" o "1 de 2 · 2 de 3".
   */
  installmentProgressLabel: string | null;
  /** Monto total adelantado (principal) de los adelantos que impactan el mes. */
  principalTotal: number;
  advancesTotal: number;
  /**
   * Comisión correspondiente a la(s) cuota(s) del mes.
   * Solo informativa: no se suma al total a descontar ni al reembolso.
   */
  feesTotal: number;
  /** Valor a descontar por cuota(s) en el mes (principal del periodo). */
  loanInstallmentsTotal: number;
  grandTotal: number;
}

export interface EmployerPayrollClosureSnapshot {
  monthKey: string;
  monthLabel: string;
  totalPayrollDeductions: number;
  providerReimbursement: number;
  employeeSummaries: EmployerPayrollDeductionSummary[];
}
