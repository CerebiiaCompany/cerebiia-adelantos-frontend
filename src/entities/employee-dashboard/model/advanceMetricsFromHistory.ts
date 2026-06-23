// ⚠️ AGNOSTIC — derive dashboard advance metrics from solicitudes/history

import type { AdvanceHistoryRecord } from "@/shared/config/advanceHistory.types";
import type {
  DashboardActivityItem,
  EmployeeDashboardMetrics,
} from "./types";

export function getAdvanceMonthKey(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${date.getFullYear()}-${month}`;
}

export function countsTowardAdvanceLimit(
  status: AdvanceHistoryRecord["status"],
): boolean {
  return status !== "no_aprobado";
}

function formatAdvanceActivityDate(date: Date): string {
  const now = new Date();
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  if (isToday) {
    return `Hoy, ${date.toLocaleTimeString("es-CO", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })}`;
  }

  return date.toLocaleDateString("es-CO", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function buildMonthlyAdvancesFromHistory(
  records: AdvanceHistoryRecord[],
): Record<string, number> {
  const monthlyAdvances: Record<string, number> = {};

  for (const record of records) {
    if (!countsTowardAdvanceLimit(record.status)) continue;

    const monthKey = getAdvanceMonthKey(record.requestedAt);
    monthlyAdvances[monthKey] =
      (monthlyAdvances[monthKey] ?? 0) + record.amount;
  }

  return monthlyAdvances;
}

export function buildActivityFromAdvanceHistory(
  records: AdvanceHistoryRecord[],
  limit = 10,
): DashboardActivityItem[] {
  return [...records]
    .filter((record) => countsTowardAdvanceLimit(record.status))
    .sort((a, b) => b.requestedAt.getTime() - a.requestedAt.getTime())
    .slice(0, limit)
    .map((record) => ({
      type: "adelanto",
      amount: -record.amount,
      date: formatAdvanceActivityDate(record.requestedAt),
      desc: "Adelanto de nómina",
      createdAt: record.requestedAt.toISOString(),
    }));
}

export function deriveAdvanceMetricsFromHistory(
  records: AdvanceHistoryRecord[],
): Pick<
  EmployeeDashboardMetrics,
  "totalAdvancedThisMonth" | "monthlyAdvances" | "activity"
> {
  const monthlyAdvances = buildMonthlyAdvancesFromHistory(records);
  const currentMonthKey = getAdvanceMonthKey(new Date());

  return {
    totalAdvancedThisMonth: monthlyAdvances[currentMonthKey] ?? 0,
    monthlyAdvances,
    activity: buildActivityFromAdvanceHistory(records),
  };
}
