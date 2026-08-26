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
  | "pagada"
  | "completado";

export interface EmployerLoanInstallmentRecord {
  id: string;
  employeeName: string;
  totalLoanAmount: number;
  totalInstallments: number;
  paidInstallments: number;
  /** Cantidad de cuotas que faltan por pagar. */
  pendingInstallments: number;
  installmentValue: number;
  pendingBalance: number;
  currentMonthStatus: EmployerLoanInstallmentStatus;
  /** Fecha en que se liberó la primera cuota (o null si aún no hay liberaciones). */
  firstLiberationDate: string | null;
  /** True si todas las cuotas del adelanto ya fueron saldadas. */
  isFullyPaid: boolean;
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
  /** Monto de cuotas del mes ya liberadas/saldadas por Super Admin. */
  paidAmount: number;
  /** Monto de cuotas del mes pendientes por liquidar/descontar. */
  pendingAmount: number;
  /** True si todas las cuotas de este mes están saldadas. */
  isSettled: boolean;
  /** Etiqueta de estado para la tabla (ej. "Saldado", "Pendiente"). */
  statusLabel: string;
}

export interface EmployerPayrollClosureSnapshot {
  monthKey: string;
  monthLabel: string;
  /** Total general consolidado generado en el mes. */
  totalPayrollDeductions: number;
  /** Total pendiente por descontar/reembolsar (restando lo saldado). */
  totalPending: number;
  /** Total liberado/saldado por el Super Admin. */
  totalPaid: number;
  /** Monto de reembolso pendiente al proveedor. */
  providerReimbursement: number;
  /** Reembolso consolidado original del mes. */
  providerReimbursementTotal: number;
  /** True si toda la nómina del mes está a paz y salvo. */
  isAllSettled: boolean;
  employeeSummaries: EmployerPayrollDeductionSummary[];
}

export interface EmployerNominaCuotaDetalle {
  solicitud_id: string;
  cuota_numero: number;
  total_cuotas: number;
  fecha_corte: string;
  estado_cuota: string;
  monto_solicitud: string;
  monto_a_descontar: string;
}

export interface EmployerNominaEmpleadoResumen {
  fullName: string;
  documento: string;
  cantidadAdelantos: number;
  cuotasMes: number;
  totalDescontar: number;
  cuotas: EmployerNominaCuotaDetalle[];
}

export interface EmployerNominaDescuentosSnapshot {
  periodo: string;
  totalDescontar: number;
  empleadosConDescuento: number;
  cuotasDelMes: number;
  resumen: EmployerNominaEmpleadoResumen[];
}
