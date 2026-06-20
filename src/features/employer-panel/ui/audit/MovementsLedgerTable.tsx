import { useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowDownCircle,
  BookOpen,
  Search,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import type { EmployerMovementRecord } from "@/entities/employer-audit";
import { formatCOP } from "@/shared/lib";
import { downloadCsvFile } from "@/shared/lib/csv";
import { cn } from "@/lib/utils";
import { useEmployerMovementsLedger } from "../../model/useEmployerAuditData";
import { ExportReportButton } from "./ExportReportButton";

function filterRecords(
  records: EmployerMovementRecord[],
  query: string,
): EmployerMovementRecord[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return records;

  return records.filter(
    (record) =>
      record.transferId.toLowerCase().includes(normalized) ||
      record.employeeName.toLowerCase().includes(normalized),
  );
}

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
  const { data, isLoading, isError } = useEmployerMovementsLedger();

  const filteredRecords = useMemo(
    () => filterRecords(data ?? [], search),
    [data, search],
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
        "Empleado",
        "Monto Neto Desembolsado",
      ],
      ...filteredRecords.map((record) => [
        record.transferId,
        formatDateTime(record.occurredAt),
        record.type === "adelanto" ? "Adelanto" : "Cuota",
        record.employeeName,
        record.netDisbursedAmount,
      ]),
    ];

    downloadCsvFile("historial-movimientos-cerebiia", rows);
    toast.success("Reporte exportado correctamente.");
  };

  return (
    <div className="glass-card glow-border rounded-xl p-4 sm:p-5">
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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

      {isLoading ? <TableSkeleton /> : null}

      {isError ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-8 text-center">
          <AlertCircle className="h-8 w-8 text-destructive" />
          <p className="text-sm text-destructive">
            No pudimos cargar el historial de movimientos.
          </p>
        </div>
      ) : null}

      {!isLoading && !isError ? (
        <div className="overflow-x-auto rounded-xl border border-border/80">
          <table className="w-full min-w-[800px] text-sm">
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
                  <td colSpan={5} className="px-4 py-10 text-center">
                    <div className="mx-auto flex max-w-sm flex-col items-center gap-2 text-muted-foreground">
                      <BookOpen className="h-8 w-8 opacity-60" />
                      <p className="text-sm">
                        {search.trim()
                          ? "No hay movimientos que coincidan con tu búsqueda."
                          : "Aún no hay movimientos registrados. Se generan automáticamente al solicitar un adelanto."}
                      </p>
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
  );
}
