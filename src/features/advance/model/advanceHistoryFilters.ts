import type { AdvanceHistoryRecord } from "@/shared/config/advanceHistory";
import {
  ADVANCE_HISTORY_STATUS_LABEL,
  type AdvanceHistoryStatus,
} from "@/shared/config/advanceHistory";

export type AdvanceHistoryStatusFilter = AdvanceHistoryStatus | "all";

export type AdvanceHistoryFilters = {
  status: AdvanceHistoryStatusFilter;
  dateFrom: string;
  dateTo: string;
};

export const DEFAULT_ADVANCE_HISTORY_FILTERS: AdvanceHistoryFilters = {
  status: "all",
  dateFrom: "",
  dateTo: "",
};

export const ADVANCE_HISTORY_STATUS_FILTER_OPTIONS: {
  value: AdvanceHistoryStatusFilter;
  label: string;
}[] = [
  { value: "all", label: "Todos los estados" },
  ...(
    Object.entries(ADVANCE_HISTORY_STATUS_LABEL) as [
      AdvanceHistoryStatus,
      string,
    ][]
  ).map(([value, label]) => ({ value, label })),
];

function parseDateInputStart(value: string): Date | null {
  if (!value) return null;
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day, 0, 0, 0, 0);
}

function parseDateInputEnd(value: string): Date | null {
  if (!value) return null;
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day, 23, 59, 59, 999);
}

export function hasActiveAdvanceHistoryFilters(
  filters: AdvanceHistoryFilters,
): boolean {
  return (
    filters.status !== "all" ||
    filters.dateFrom !== "" ||
    filters.dateTo !== ""
  );
}

export function filterAdvanceHistory(
  records: AdvanceHistoryRecord[],
  filters: AdvanceHistoryFilters,
): AdvanceHistoryRecord[] {
  const from = parseDateInputStart(filters.dateFrom);
  const to = parseDateInputEnd(filters.dateTo);

  return records.filter((record) => {
    if (filters.status !== "all" && record.status !== filters.status) {
      return false;
    }

    if (from && record.requestedAt < from) {
      return false;
    }

    if (to && record.requestedAt > to) {
      return false;
    }

    return true;
  });
}
