import {
  countsTowardAdvanceLimit,
  getAdvanceMonthKey,
} from "@/entities/employee-dashboard";
import type { AdvanceHistoryRecord } from "@/shared/config/advanceHistory";

export type ControlMonthlyAdvancePoint = {
  name: string;
  adelantos: number;
  limite: number;
  count: number;
  sortKey: string;
  disponible: number;
};

function formatControlMonthLabel(date: Date): string {
  const label = date.toLocaleDateString("es-CO", { month: "short" });
  const normalized = label.replace(/\./g, "");
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

/** Últimos 4 meses; solo cuenta adelantos que afectan cupo (excluye no aprobados). */
export function buildControlMonthlyAdvanceData(
  advanceHistory: AdvanceHistoryRecord[],
  limitAmount: number,
  referenceDate: Date = new Date(),
): ControlMonthlyAdvancePoint[] {
  const countableHistory = advanceHistory.filter((record) =>
    countsTowardAdvanceLimit(record.status),
  );

  return Array.from({ length: 4 }, (_, index) => {
    const date = new Date(referenceDate);
    date.setDate(1);
    date.setMonth(referenceDate.getMonth() - (3 - index));
    const monthKey = getAdvanceMonthKey(date);
    const monthRecords = countableHistory.filter(
      (record) => getAdvanceMonthKey(record.requestedAt) === monthKey,
    );
    const adelantos = monthRecords.reduce(
      (sum, record) => sum + record.amount,
      0,
    );

    return {
      name: formatControlMonthLabel(date),
      adelantos,
      limite: limitAmount,
      count: monthRecords.length,
      sortKey: monthKey,
      disponible: Math.max(limitAmount - adelantos, 0),
    };
  });
}
