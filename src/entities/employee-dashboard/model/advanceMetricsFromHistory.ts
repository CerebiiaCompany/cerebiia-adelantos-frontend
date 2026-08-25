// ⚠️ AGNOSTIC — derive dashboard advance metrics from solicitudes/history

import type { AdvanceHistoryRecord } from "@/shared/config/advanceHistory.types";
import type {
  DashboardActivityItem,
  EmployeeDashboardMetrics,
} from "./types";

function toSafeDate(d: unknown): Date {
  if (d instanceof Date && !Number.isNaN(d.getTime())) return d;
  if (typeof d === "string" || typeof d === "number") {
    const parsed = new Date(d);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  return new Date();
}

export function getAdvanceMonthKey(date?: Date | string | null): string {
  const safe = toSafeDate(date);
  const month = String(safe.getMonth() + 1).padStart(2, "0");
  return `${safe.getFullYear()}-${month}`;
}

export function countsTowardAdvanceLimit(
  status?: AdvanceHistoryRecord["status"] | string | null,
): boolean {
  return status !== "no_aprobado";
}

function formatAdvanceActivityDate(date?: Date | string | null): string {
  const safe = toSafeDate(date);
  const now = new Date();
  const isToday =
    safe.getDate() === now.getDate() &&
    safe.getMonth() === now.getMonth() &&
    safe.getFullYear() === now.getFullYear();

  if (isToday) {
    return `Hoy, ${safe.toLocaleTimeString("es-CO", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })}`;
  }

  return safe.toLocaleDateString("es-CO", {
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

  for (const record of records || []) {
    if (!record || !countsTowardAdvanceLimit(record.status)) continue;

    const monthKey = getAdvanceMonthKey(record.requestedAt);
    monthlyAdvances[monthKey] =
      (monthlyAdvances[monthKey] ?? 0) + (Number(record.amount) || 0);
  }

  return monthlyAdvances;
}

export function buildActivityFromAdvanceHistory(
  records: AdvanceHistoryRecord[],
  limit = 10,
): DashboardActivityItem[] {
  return [...(records || [])]
    .filter((record) => record && countsTowardAdvanceLimit(record.status))
    .sort(
      (a, b) =>
        toSafeDate(b.requestedAt).getTime() -
        toSafeDate(a.requestedAt).getTime(),
    )
    .slice(0, limit)
    .map((record) => {
      const safeDate = toSafeDate(record.requestedAt);
      return {
        type: "adelanto",
        amount: -(Number(record.amount) || 0),
        date: formatAdvanceActivityDate(safeDate),
        desc: "Adelanto de nómina",
        createdAt: safeDate.toISOString(),
      };
    });
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
