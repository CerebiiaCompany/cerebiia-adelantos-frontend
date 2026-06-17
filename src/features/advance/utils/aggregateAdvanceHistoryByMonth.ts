import type { AdvanceHistoryRecord } from "@/shared/config/advanceHistory.types";

export type MonthlyAdvanceChartPoint = {
  name: string;
  adelantos: number;
  limite: number;
  disponible: number;
  count: number;
  sortKey: string;
};

const DEFAULT_MONTHLY_LIMIT = 2_400_000;

export function aggregateAdvanceHistoryByMonth(
  records: AdvanceHistoryRecord[],
  monthlyLimit = DEFAULT_MONTHLY_LIMIT,
): MonthlyAdvanceChartPoint[] {
  const buckets = new Map<
    string,
    { adelantos: number; count: number; name: string; sortKey: string }
  >();

  for (const record of records) {
    if (record.status === "no_aprobado") continue;

    const date = record.requestedAt;
    const sortKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const name = date.toLocaleDateString("es-CO", { month: "short" });
    const existing = buckets.get(sortKey);

    if (existing) {
      existing.adelantos += record.amount;
      existing.count += 1;
    } else {
      buckets.set(sortKey, {
        adelantos: record.amount,
        count: 1,
        name: name.charAt(0).toUpperCase() + name.slice(1),
        sortKey,
      });
    }
  }

  return [...buckets.values()]
    .sort((a, b) => a.sortKey.localeCompare(b.sortKey))
    .map((bucket) => ({
      name: bucket.name,
      adelantos: bucket.adelantos,
      limite: monthlyLimit,
      disponible: Math.max(monthlyLimit - bucket.adelantos, 0),
      count: bucket.count,
      sortKey: bucket.sortKey,
    }));
}
