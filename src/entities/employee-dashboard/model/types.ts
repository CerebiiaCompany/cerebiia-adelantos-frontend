// ⚠️ AGNOSTIC — employee dashboard domain types

import type {
  AdvanceHistoryStatus,
  AdvanceReceiptStatus,
} from "@/shared/config/advanceHistory.types";

export type DashboardActivityType = "adelanto" | "ingreso";

export type DashboardActivityStatus = "solicitado" | "aprobado" | "rechazado";

export interface DashboardActivityItem {
  id?: string;
  type: DashboardActivityType;
  amount: number;
  date: string;
  desc: string;
  createdAt: string;
  status?: DashboardActivityStatus;
  statusLabel?: string;
  rejectionReason?: string | null;
}

export interface DashboardChartPoint {
  name: string;
  ingresos: number;
  adelantos: number;
}

export interface EmployeeDashboardMetrics {
  totalAdvancedThisMonth: number;
  accumulatedIncome: number;
  incomeToday: number;
  activity: DashboardActivityItem[];
  monthlyAdvances: Record<string, number>;
  advanceHistory: SerializedAdvanceHistoryRecord[];
}

export type SerializedAdvanceHistoryRecord = {
  id: string;
  amount: number;
  netAmount?: number;
  requestedAt: string;
  periodLabel: string;
  status: AdvanceHistoryStatus;
  transactionFeeAmount: number;
  folio: string;
  receiptStatus: AdvanceReceiptStatus | null;
  paymentMethod: string;
  installments?: number;
  bankName?: string;
  accountTypeLabel?: string;
  accountNumber?: string;
};

export interface EmployeeDashboardSnapshot {
  displayName: string;
  salary: number;
  availableAdvance: number;
  /** Tope mensual según porcentaje global (GET /empleados/me/). */
  maxAdvanceLimit: number;
  /** Porcentaje vigente configurado por super admin. */
  advancePercentage?: number;
  /** Esperando GET /empleados/me/ con API configurada. */
  isNominaLoading?: boolean;
  accumulatedIncome: number;
  incomeToday: number;
  totalAdvancedThisMonth: number;
  /** Días laborados devengados en el mes en curso (base 30 días). */
  diasLaboradosMes?: number;
  /** Salario devengado acumulado en el mes en curso según días laborados. */
  accruedSalaryMonth?: number;
  walletBalance: number;
  chartData: DashboardChartPoint[];
  recentActivity: DashboardActivityItem[];
}
