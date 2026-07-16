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
  advancesTotal: number;
  feesTotal: number;
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
