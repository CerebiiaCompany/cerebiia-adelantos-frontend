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
  return (
    Boolean(status) &&
    status !== "no_aprobado" &&
    status !== "rechazado" &&
    status !== "cancelado"
  );
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

export function resolveActivityStatus(
  record: AdvanceHistoryRecord,
): { status: "solicitado" | "aprobado" | "rechazado"; statusLabel: string } {
  const rawEstado = String(record.estadoApi || "").toLowerCase().trim();
  const rawStatus = String(record.status || "").toLowerCase().trim();

  if (
    rawEstado === "rechazado" ||
    rawStatus === "no_aprobado" ||
    rawStatus === "rechazado" ||
    rawStatus === "cancelado"
  ) {
    return { status: "rechazado", statusLabel: "Rechazado" };
  }

  if (
    rawEstado === "aprobado" ||
    rawEstado === "pagado" ||
    rawStatus === "aprobado"
  ) {
    return { status: "aprobado", statusLabel: "Aprobado" };
  }

  return { status: "solicitado", statusLabel: "Solicitado" };
}

export function buildActivityFromAdvanceHistory(
  records: AdvanceHistoryRecord[],
  limit = 10,
): DashboardActivityItem[] {
  return [...(records || [])]
    .filter((record) => Boolean(record && record.requestedAt))
    .sort(
      (a, b) =>
        toSafeDate(b.requestedAt).getTime() -
        toSafeDate(a.requestedAt).getTime(),
    )
    .slice(0, limit)
    .map((record) => {
      const safeDate = toSafeDate(record.requestedAt);
      const { status, statusLabel } = resolveActivityStatus(record);
      return {
        id: record.id,
        type: "adelanto",
        amount: -(Number(record.amount) || 0),
        date: formatAdvanceActivityDate(safeDate),
        desc: "Adelanto de nómina",
        createdAt: safeDate.toISOString(),
        status,
        statusLabel,
        rejectionReason: record.rejectionReason,
      };
    });
}

export function deriveAdvanceMetricsFromHistory(
  records: AdvanceHistoryRecord[],
  referenceDate: Date = new Date(),
): Pick<
  EmployeeDashboardMetrics,
  "totalAdvancedThisMonth" | "monthlyAdvances" | "activity"
> {
  const monthlyAdvances = buildMonthlyAdvancesFromHistory(records);
  const currentMonthKey = getAdvanceMonthKey(referenceDate);

  return {
    totalAdvancedThisMonth: monthlyAdvances[currentMonthKey] ?? 0,
    monthlyAdvances,
    activity: buildActivityFromAdvanceHistory(records),
  };
}
