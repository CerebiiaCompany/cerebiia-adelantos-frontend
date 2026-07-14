import { useMemo, useState } from "react";
import {
  ArrowDownCircle,
  BookOpen,
  RotateCcw,
  Search,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import type {
  EmployerAdvanceAuditStatus,
  EmployerMovementRecord,
} from "@/entities/employer-audit";
import { AdvancePaymentEvidenceDialog } from "@/features/advance/ui/AdvancePaymentEvidenceDialog";
import { formatCOP } from "@/shared/lib";
import { downloadCsvFile } from "@/shared/lib/csv";
import { cn } from "@/lib/utils";
import {
  DEFAULT_MOVEMENT_LEDGER_FILTERS,
  filterMovementLedgerRecords,
  hasActiveMovementLedgerFilters,
  MOVEMENT_LEDGER_STATUS_FILTER_OPTIONS,
  type MovementLedgerFilters,
  type MovementLedgerStatusFilter,
} from "../../model/movementLedgerFilters";
import { useEmployerMovementsLedger } from "../../model/useEmployerAuditData";
import { EmployerPanelUnavailableNotice } from "../EmployerPanelUnavailableNotice";
import { AuditStatusBadge } from "./AuditStatusBadge";
import { ExportReportButton } from "./ExportReportButton";

function formatDateTime(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function getMovementStatusLabel(status: EmployerAdvanceAuditStatus): string {
  if (status === "procesado") return "Transferido";
  if (status === "en_curso") return "En curso";
  return "Rechazado";
}

function getMovementStatusTone(
  status: EmployerAdvanceAuditStatus,
): "success" | "warning" | "danger" {
  if (status === "procesado") return "success";
  if (status === "en_curso") return "warning";
  return "danger";
}

function TableSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, index) => (
        <Skeleton key={index} className="h-12 w-full rounded-lg" />
      ))}
    </div>
  );
}

export function MovementsLedgerTable() {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<MovementLedgerFilters>(
    DEFAULT_MOVEMENT_LEDGER_FILTERS,
  );
  const [evidenceRecord, setEvidenceRecord] =
    useState<EmployerMovementRecord | null>(null);
  const { data, isLoading, isError } = useEmployerMovementsLedger();

  const filtersActive = hasActiveMovementLedgerFilters(filters);

  const filteredRecords = useMemo(
    () => filterMovementLedgerRecords(data ?? [], search, filters),
    [data, search, filters],
  );

  const handleExport = () => {
    if (!filteredRecords.length) {
      toast.info("No hay movimientos para exportar.");
      return;
    }

    const rows: (string | number)[][] = [
      [
        "ID Transferencia",
        "Fecha/Hora",
        "Tipo",
        "Estado",
        "Evidencia",
        "Motivo",
        "Empleado",
        "Monto Neto Desembolsado",
      ],
      ...filteredRecords.map((record) => [
        record.transferId,
        formatDateTime(record.occurredAt),
        record.type === "adelanto" ? "Adelanto" : "Cuota",
        getMovementStatusLabel(record.status),
        record.paymentEvidenceUrl ?? "",
        record.status === "rechazado" ? (record.rejectionReason ?? "") : "",
        record.employeeName,
        record.netDisbursedAmount,
      ]),
    ];

    downloadCsvFile("historial-movimientos-cerebiia", rows);
    toast.success("Reporte exportado correctamente.");
  };

  const emptyMessage =
    search.trim() || filtersActive
      ? "No hay movimientos que coincidan con tu búsqueda o filtros."
      : "Aún no hay movimientos registrados. Se generan automáticamente al solicitar un adelanto.";

  return (
    <>
      <div className="glass-card glow-border rounded-xl p-4 sm:p-5">
        <div className="mb-5 space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative max-w-md flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por ID transferencia o empleado..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="h-11 rounded-xl border-border/80 bg-background/80 pl-10"
                disabled={isLoading}
              />
            </div>
            <ExportReportButton
              onClick={handleExport}
              disabled={isLoading || filteredRecords.length === 0}
            />
          </div>

          <div className="grid gap-3 border-t border-border/60 pt-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="movement-filter-status">Estado</Label>
              <Select
                value={filters.status}
                onValueChange={(value) =>
                  setFilters((current) => ({
                    ...current,
                    status: value as MovementLedgerStatusFilter,
                  }))
                }
                disabled={isLoading}
              >
                <SelectTrigger
                  id="movement-filter-status"
                  className="h-11 rounded-xl border-border/80 bg-background/80"
                >
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  {MOVEMENT_LEDGER_STATUS_FILTER_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="movement-filter-from">Desde</Label>
              <Input
                id="movement-filter-from"
                type="date"
                value={filters.dateFrom}
                max={filters.dateTo || undefined}
                onChange={(event) =>
                  setFilters((current) => ({
                    ...current,
                    dateFrom: event.target.value,
                  }))
                }
                className="h-11 rounded-xl border-border/80 bg-background/80"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="movement-filter-to">Hasta</Label>
              <Input
                id="movement-filter-to"
                type="date"
                value={filters.dateTo}
                min={filters.dateFrom || undefined}
                onChange={(event) =>
                  setFilters((current) => ({
                    ...current,
                    dateTo: event.target.value,
                  }))
                }
                className="h-11 rounded-xl border-border/80 bg-background/80"
                disabled={isLoading}
              />
            </div>

            <div className="flex items-end">
              <button
                type="button"
                onClick={() => setFilters(DEFAULT_MOVEMENT_LEDGER_FILTERS)}
                disabled={!filtersActive || isLoading}
                className={cn(
                  "inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border px-3 text-sm font-medium transition-colors",
                  filtersActive
                    ? "border-primary/20 text-primary hover:bg-primary/5"
                    : "cursor-not-allowed border-border/60 text-muted-foreground/60",
                )}
              >
                <RotateCcw className="h-4 w-4" />
                Limpiar filtros
              </button>
            </div>
          </div>
        </div>

        {isLoading ? <TableSkeleton /> : null}

        {isError ? (
          <EmployerPanelUnavailableNotice
            message="El historial de movimientos no está disponible en este momento."
            description="Esta sección se habilitará cuando haya información para mostrar."
          />
        ) : null}

        {!isLoading && !isError ? (
          <div className="overflow-x-auto rounded-xl border border-border/80">
            <table className="w-full min-w-[1080px] text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/50 text-left">
                  <th className="px-4 py-3 font-semibold text-muted-foreground">
                    Código de transferencia
                  </th>
                  <th className="px-4 py-3 font-semibold text-muted-foreground">
                    Fecha y hora
                  </th>
                  <th className="px-4 py-3 font-semibold text-muted-foreground">
                    Tipo de movimiento
                  </th>
                  <th className="px-4 py-3 font-semibold text-muted-foreground">
                    Estado
                  </th>
                  <th className="px-4 py-3 font-semibold text-muted-foreground">
                    Evidencia
                  </th>
                  <th className="px-4 py-3 font-semibold text-muted-foreground">
                    Motivo
                  </th>
                  <th className="px-4 py-3 font-semibold text-muted-foreground">
                    Empleado
                  </th>
                  <th className="px-4 py-3 font-semibold text-muted-foreground">
                    Valor neto transferido
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-10 text-center">
                      <div className="mx-auto flex max-w-sm flex-col items-center gap-2 text-muted-foreground">
                        <BookOpen className="h-8 w-8 opacity-60" />
                        <p className="text-sm">{emptyMessage}</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((record) => (
                    <tr
                      key={record.id}
                      className="border-b border-border/70 last:border-0"
                    >
                      <td className="px-4 py-3.5 font-mono text-xs text-foreground">
                        {record.transferId}
                      </td>
                      <td className="px-4 py-3.5 text-muted-foreground">
                        {formatDateTime(record.occurredAt)}
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium",
                            record.type === "adelanto"
                              ? "bg-primary/10 text-primary"
                              : "bg-[hsl(260_70%_50%)]/10 text-[hsl(260_70%_50%)]",
                          )}
                        >
                          {record.type === "adelanto" ? (
                            <Zap className="h-3 w-3" />
                          ) : (
                            <ArrowDownCircle className="h-3 w-3" />
                          )}
                          {record.type === "adelanto" ? "Adelanto" : "Cuota"}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <AuditStatusBadge
                          label={getMovementStatusLabel(record.status)}
                          tone={getMovementStatusTone(record.status)}
                        />
                      </td>
                      <td className="px-4 py-3.5">
                        {record.paymentEvidenceUrl ? (
                          <button
                            type="button"
                            onClick={() => setEvidenceRecord(record)}
                            className="text-sm font-medium text-primary transition-colors hover:text-primary/80 hover:underline"
                          >
                            Ver evidencia
                          </button>
                        ) : (
                          <span className="text-sm text-muted-foreground/60">
                            No disponible
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        {record.status === "rechazado" &&
                        record.rejectionReason ? (
                          <p
                            className="max-w-[14rem] text-sm leading-snug text-foreground"
                            title={record.rejectionReason}
                          >
                            {record.rejectionReason}
                          </p>
                        ) : (
                          <span className="text-sm text-muted-foreground/60">
                            —
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 font-medium text-foreground">
                        {record.employeeName}
                      </td>
                      <td className="px-4 py-3.5 tabular-nums font-semibold text-foreground">
                        {formatCOP(record.netDisbursedAmount)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : null}

        {!isLoading && !isError && data ? (
          <p className="mt-4 text-xs text-muted-foreground">
            {filteredRecords.length} de {data.length} transacción
            {data.length === 1 ? "" : "es"} mostrada
            {filteredRecords.length === 1 ? "" : "s"}. Libro contable de
            auditoría financiera.
          </p>
        ) : null}
      </div>

      <AdvancePaymentEvidenceDialog
        open={Boolean(evidenceRecord)}
        onOpenChange={(open) => {
          if (!open) setEvidenceRecord(null);
        }}
        evidenceUrl={evidenceRecord?.paymentEvidenceUrl ?? null}
        amount={evidenceRecord?.netDisbursedAmount}
        requestedAt={
          evidenceRecord ? new Date(evidenceRecord.occurredAt) : undefined
        }
      />
    </>
  );
}
