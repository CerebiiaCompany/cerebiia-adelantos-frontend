import type {
  EmployerAdvanceAuditStatus,
  EmployerMovementRecord,
} from "@/entities/employer-audit";

export type MovementLedgerStatusFilter = EmployerAdvanceAuditStatus | "all";

export type MovementLedgerFilters = {
  status: MovementLedgerStatusFilter;
  dateFrom: string;
  dateTo: string;
};

export const DEFAULT_MOVEMENT_LEDGER_FILTERS: MovementLedgerFilters = {
  status: "all",
  dateFrom: "",
  dateTo: "",
};

export const MOVEMENT_LEDGER_STATUS_FILTER_OPTIONS: {
  value: MovementLedgerStatusFilter;
  label: string;
}[] = [
  { value: "all", label: "Todos los estados" },
  { value: "procesado", label: "Transferido" },
  { value: "en_curso", label: "En curso" },
  { value: "rechazado", label: "Rechazado" },
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

export function hasActiveMovementLedgerFilters(
  filters: MovementLedgerFilters,
): boolean {
  return (
    filters.status !== "all" ||
    filters.dateFrom !== "" ||
    filters.dateTo !== ""
  );
}

export function filterMovementLedgerRecords(
  records: EmployerMovementRecord[],
  searchQuery: string,
  filters: MovementLedgerFilters,
): EmployerMovementRecord[] {
  const normalized = searchQuery.trim().toLowerCase();
  const from = parseDateInputStart(filters.dateFrom);
  const to = parseDateInputEnd(filters.dateTo);

  return records.filter((record) => {
    if (filters.status !== "all" && record.status !== filters.status) {
      return false;
    }

    const occurredAt = new Date(record.occurredAt);
    if (from && occurredAt < from) return false;
    if (to && occurredAt > to) return false;

    if (!normalized) return true;

    return (
      record.transferId.toLowerCase().includes(normalized) ||
      record.employeeName.toLowerCase().includes(normalized) ||
      (record.rejectionReason?.toLowerCase().includes(normalized) ?? false)
    );
  });
}
