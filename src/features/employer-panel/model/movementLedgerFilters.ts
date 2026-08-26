import type {
  EmployerAdvanceAuditStatus,
  EmployerMovementRecord,
} from "@/entities/employer-audit";

export type MovementLedgerStatusFilter = EmployerAdvanceAuditStatus | "all";

export type MovementLedgerFilters = {
  status: MovementLedgerStatusFilter;
  period: string;
};

export const DEFAULT_MOVEMENT_LEDGER_FILTERS: MovementLedgerFilters = {
  status: "all",
  period: "all",
};

export const MOVEMENT_LEDGER_STATUS_FILTER_OPTIONS: {
  value: MovementLedgerStatusFilter;
  label: string;
}[] = [
  { value: "all", label: "Todos los estados" },
  { value: "procesado", label: "Pagado" },
  { value: "en_curso", label: "En curso" },
  { value: "rechazado", label: "Rechazado" },
];

export function extractMonthKey(isoDate: string): string {
  if (!isoDate) return "";
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return isoDate.slice(0, 7);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

export function formatPeriodOptionLabel(periodKey: string): string {
  if (periodKey === "all") return "Todos los periodos";
  const [year, month] = periodKey.split("-").map(Number);
  if (!year || !month) return periodKey;
  const date = new Date(year, month - 1, 1);
  const label = date.toLocaleDateString("es-CO", {
    month: "long",
    year: "numeric",
  });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function hasActiveMovementLedgerFilters(
  filters: MovementLedgerFilters,
): boolean {
  return filters.status !== "all" || filters.period !== "all";
}

export function filterMovementLedgerRecords(
  records: EmployerMovementRecord[],
  searchQuery: string,
  filters: MovementLedgerFilters,
): EmployerMovementRecord[] {
  const normalized = searchQuery.trim().toLowerCase();

  return records.filter((record) => {
    if (filters.status !== "all" && record.status !== filters.status) {
      return false;
    }

    if (filters.period && filters.period !== "all") {
      const recordMonth = extractMonthKey(record.occurredAt);
      if (recordMonth !== filters.period) {
        return false;
      }
    }

    if (!normalized) return true;

    return (
      record.transferId.toLowerCase().includes(normalized) ||
      record.employeeName.toLowerCase().includes(normalized) ||
      (record.rejectionReason?.toLowerCase().includes(normalized) ?? false)
    );
  });
}
