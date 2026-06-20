// ⚠️ AGNOSTIC — employer audit & payroll transparency records

export type EmployerAdvanceAuditStatus = "procesado" | "en_curso" | "rechazado";

export interface EmployerAdvanceAuditRecord {
  id: string;
  employeeName: string;
  employeeDocument: string;
  baseSalary: number;
  advancedAmount: number;
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
  netDisbursedAmount: number;
  employeeName: string;
}

export interface EmployerPayrollDeductionSummary {
  employeeName: string;
  employeeDocument: string;
  advancesTotal: number;
  feesTotal: number;
  loanInstallmentsTotal: number;
  grandTotal: number;
}

export interface EmployerPayrollClosureSnapshot {
  monthLabel: string;
  totalPayrollDeductions: number;
  providerReimbursement: number;
  employeeSummaries: EmployerPayrollDeductionSummary[];
}
