// ⚠️ AGNOSTIC — employee dashboard domain types

import type {
  AdvanceHistoryStatus,
  AdvanceReceiptStatus,
} from "@/shared/config/advanceHistory.types";

export type DashboardActivityType = "adelanto" | "ingreso";

export interface DashboardActivityItem {
  type: DashboardActivityType;
  amount: number;
  date: string;
  desc: string;
  createdAt: string;
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
  requestedAt: string;
  periodLabel: string;
  status: AdvanceHistoryStatus;
  transactionFeeRate: number;
  transactionFeeAmount: number;
  folio: string;
  receiptStatus: AdvanceReceiptStatus | null;
  paymentMethod: string;
};

export interface EmployeeDashboardSnapshot {
  displayName: string;
  salary: number;
  availableAdvance: number;
  accumulatedIncome: number;
  incomeToday: number;
  totalAdvancedThisMonth: number;
  chartData: DashboardChartPoint[];
  recentActivity: DashboardActivityItem[];
}
