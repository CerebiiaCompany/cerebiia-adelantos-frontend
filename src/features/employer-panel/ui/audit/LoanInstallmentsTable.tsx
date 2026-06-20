import { useMemo, useState } from "react";
import { AlertCircle, CalendarClock, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import type { EmployerLoanInstallmentRecord } from "@/entities/employer-audit";
import { formatCOP } from "@/shared/lib";
import { cn } from "@/lib/utils";
import { useEmployerLoanTracking } from "../../model/useEmployerAuditData";
import { AuditStatusBadge } from "./AuditStatusBadge";

function filterRecords(
  records: EmployerLoanInstallmentRecord[],
  query: string,
): EmployerLoanInstallmentRecord[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return records;

  return records.filter((record) =>
    record.employeeName.toLowerCase().includes(normalized),
  );
}

function getInstallmentStatus(
  status: EmployerLoanInstallmentRecord["currentMonthStatus"],
): { label: string; tone: "success" | "warning" | "danger" | "info" } {
  if (status === "al_dia") return { label: "Al día", tone: "success" };
  if (status === "pendiente") return { label: "Pendiente", tone: "warning" };
  if (status === "vencida") return { label: "Vencida", tone: "danger" };
  return { label: "Pagada", tone: "info" };
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

export function LoanInstallmentsTable() {
  const [search, setSearch] = useState("");
  const { data, isLoading, isError } = useEmployerLoanTracking();

  const filteredRecords = useMemo(
    () => filterRecords(data ?? [], search),
    [data, search],
  );

  return (
    <div className="glass-card glow-border rounded-xl p-4 sm:p-5">
      <div className="relative mb-5 max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por empleado..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="h-11 rounded-xl border-border/80 bg-background/80 pl-10"
          disabled={isLoading}
        />
      </div>

      {isLoading ? <TableSkeleton /> : null}

      {isError ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-8 text-center">
          <AlertCircle className="h-8 w-8 text-destructive" />
          <p className="text-sm text-destructive">
            No pudimos cargar el seguimiento de cuotas.
          </p>
        </div>
      ) : null}

      {!isLoading && !isError ? (
        <div className="overflow-x-auto rounded-xl border border-border/80">
          <table className="w-full min-w-[880px] text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/50 text-left">
                <th className="px-4 py-3 font-semibold text-muted-foreground">
                  Empleado
                </th>
                <th className="px-4 py-3 font-semibold text-muted-foreground">
                  Total a recuperar
                </th>
                <th className="px-4 py-3 font-semibold text-muted-foreground">
                  Cuotas pagadas
                </th>
                <th className="px-4 py-3 font-semibold text-muted-foreground">
                  Valor de cada cuota
                </th>
                <th className="px-4 py-3 font-semibold text-muted-foreground">
                  Saldo por descontar
                </th>
                <th className="px-4 py-3 font-semibold text-muted-foreground">
                  Estado cuota del mes
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center">
                    <div className="mx-auto flex max-w-sm flex-col items-center gap-2 text-muted-foreground">
                      <CalendarClock className="h-8 w-8 opacity-60" />
                      <p className="text-sm">
                        {search.trim()
                          ? "No hay adelantos en cuotas que coincidan con tu búsqueda."
                          : "No hay adelantos pagados en cuotas (2 o 3). Solo aparecen solicitudes con más de una cuota, hasta un máximo de 3."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRecords.map((record) => {
                  const status = getInstallmentStatus(
                    record.currentMonthStatus,
                  );
                  const progress =
                    (record.paidInstallments / record.totalInstallments) * 100;

                  return (
                    <tr
                      key={record.id}
                      className="border-b border-border/70 last:border-0"
                    >
                      <td className="px-4 py-3.5 font-medium text-foreground">
                        {record.employeeName}
                      </td>
                      <td className="px-4 py-3.5 tabular-nums text-foreground">
                        {formatCOP(record.totalLoanAmount)}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-medium text-foreground">
                          {record.paidInstallments} de{" "}
                          {record.totalInstallments}
                        </div>
                        <div className="mt-1.5 h-1.5 w-24 overflow-hidden rounded-full bg-secondary">
                          <div
                            className={cn(
                              "h-full rounded-full bg-gradient-to-r from-primary to-[hsl(260_70%_50%)]",
                            )}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </td>
                      <td className="px-4 py-3.5 tabular-nums text-foreground">
                        {formatCOP(record.installmentValue)}
                      </td>
                      <td className="px-4 py-3.5 tabular-nums font-medium text-foreground">
                        {formatCOP(record.pendingBalance)}
                      </td>
                      <td className="px-4 py-3.5">
                        <AuditStatusBadge
                          label={status.label}
                          tone={status.tone}
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      ) : null}

      {!isLoading && !isError && data ? (
        <p className="mt-4 text-xs text-muted-foreground">
          {filteredRecords.length} de {data.length} préstamo
          {data.length === 1 ? "" : "s"} mostrado
          {filteredRecords.length === 1 ? "" : "s"}. Máximo 3 cuotas por
          adelanto.
        </p>
      ) : null}
    </div>
  );
}
