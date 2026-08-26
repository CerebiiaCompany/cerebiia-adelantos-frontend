import { useMemo, useState } from "react";
import {
  CalendarClock,
  Coins,
  Layers,
  Receipt,
  Search,
  Users,
  Wallet,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { AnimatedCurrency } from "@/components/ui/animated-number";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { EmployerLoanInstallmentRecord } from "@/entities/employer-audit";
import { formatCOP, formatDate } from "@/shared/lib";
import { cn } from "@/lib/utils";
import { useEmployerLoanTracking } from "../../model/useEmployerAuditData";
import { EmployerPanelUnavailableNotice } from "../EmployerPanelUnavailableNotice";
import { AuditStatusBadge } from "./AuditStatusBadge";

function filterRecords(
  records: EmployerLoanInstallmentRecord[],
  query: string,
  installmentsFilter: string,
): EmployerLoanInstallmentRecord[] {
  const normalized = query.trim().toLowerCase();

  return records.filter((record) => {
    if (normalized) {
      if (!record.employeeName.toLowerCase().includes(normalized)) {
        return false;
      }
    }

    if (installmentsFilter && installmentsFilter !== "all") {
      const num = Number(installmentsFilter);
      if (record.totalInstallments !== num) {
        return false;
      }
    }

    return true;
  });
}

function getInstallmentStatus(
  status: EmployerLoanInstallmentRecord["currentMonthStatus"],
): { label: string; tone: "success" | "warning" | "danger" | "info" } {
  if (status === "completado" || status === "pagada") {
    return { label: "Completado", tone: "success" };
  }
  if (status === "al_dia") return { label: "Al día", tone: "success" };
  if (status === "pendiente") return { label: "Pendiente", tone: "warning" };
  if (status === "vencida") return { label: "Vencida", tone: "danger" };
  return { label: "Al día", tone: "success" };
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
  const [installmentsFilter, setInstallmentsFilter] = useState<string>("all");
  const { data, isLoading, isError } = useEmployerLoanTracking();

  const filteredRecords = useMemo(
    () => filterRecords(data ?? [], search, installmentsFilter),
    [data, search, installmentsFilter],
  );

  // Métricas calculadas en tiempo real para las cards informativas
  const totalSaldoPendiente = useMemo(
    () => filteredRecords.reduce((sum, r) => sum + r.pendingBalance, 0),
    [filteredRecords],
  );

  const totalSolicitado = useMemo(
    () => filteredRecords.reduce((sum, r) => sum + r.totalLoanAmount, 0),
    [filteredRecords],
  );

  const totalCuotasPendientes = useMemo(
    () => filteredRecords.reduce((sum, r) => sum + r.pendingInstallments, 0),
    [filteredRecords],
  );

  return (
    <div className="space-y-6">
      {/* Cards informativas de saldo pendiente y totales por cuotas */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="glass-card glow-border rounded-xl p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total a descontar en cuotas
            </p>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500/10 text-rose-500">
              <Receipt className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <AnimatedCurrency
              value={totalSaldoPendiente}
              className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl"
            />
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {totalSaldoPendiente === 0
              ? "Paz y salvo — Todas las cuotas han sido saldadas"
              : `${totalCuotasPendientes} cuota${totalCuotasPendientes === 1 ? "" : "s"} restante${totalCuotasPendientes === 1 ? "" : "s"} por descontar`}
          </p>
        </div>

        <div className="glass-card glow-border rounded-xl p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total solicitado
            </p>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
              <Wallet className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <AnimatedCurrency
              value={totalSolicitado}
              className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl"
            />
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Monto principal total de los adelantos multi-cuota
          </p>
        </div>

        <div className="glass-card glow-border rounded-xl p-4 sm:p-5 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Planes auditados
            </p>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <CalendarClock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {filteredRecords.length}
            </span>
            <span className="text-xs font-medium text-muted-foreground">
              plan{filteredRecords.length === 1 ? "" : "es"} registrado
              {filteredRecords.length === 1 ? "" : "s"}
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {installmentsFilter === "all"
              ? "Planes de 2 y 3 cuotas"
              : `Planes de ${installmentsFilter} cuotas`}
          </p>
        </div>
      </div>

      <div className="glass-card glow-border rounded-xl p-4 sm:p-5">
        {/* Barra de Filtros: Buscador por empleado + Selector de Cuotas */}
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 sm:max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por empleado..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="h-11 rounded-xl border-border/80 bg-background/80 pl-10"
              disabled={isLoading}
            />
          </div>

          <div className="w-full sm:w-52">
            <Select
              value={installmentsFilter}
              onValueChange={setInstallmentsFilter}
              disabled={isLoading}
            >
              <SelectTrigger className="h-11 rounded-xl border-border/80 bg-background/80">
                <div className="flex items-center gap-2 text-foreground">
                  <Layers className="h-4 w-4 shrink-0 text-primary" />
                  <SelectValue placeholder="Filtrar por cuotas" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las cuotas</SelectItem>
                <SelectItem value="2">2 cuotas</SelectItem>
                <SelectItem value="3">3 cuotas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading ? <TableSkeleton /> : null}

        {isError ? (
          <EmployerPanelUnavailableNotice
            message="El seguimiento de cuotas no está disponible en este momento."
            description="Esta sección se habilitará cuando haya información para mostrar."
          />
        ) : null}

        {!isLoading && !isError ? (
          <div className="overflow-x-auto rounded-xl border border-border/80">
            <table className="w-full min-w-[960px] text-sm">
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
                    Fecha 1.ª liberación
                  </th>
                  <th className="px-4 py-3 font-semibold text-muted-foreground">
                    Estado cuota del mes
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center">
                      <div className="mx-auto flex max-w-sm flex-col items-center gap-2 text-muted-foreground">
                        <CalendarClock className="h-8 w-8 opacity-60" />
                        <p className="text-sm">
                          {search.trim() || installmentsFilter !== "all"
                            ? "No hay adelantos en cuotas que coincidan con los filtros aplicados."
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
                          {record.pendingInstallments > 0 ? (
                            <div className="mt-1 text-[11px] text-muted-foreground">
                              {record.pendingInstallments} cuota
                              {record.pendingInstallments === 1 ? "" : "s"}{" "}
                              restante
                              {record.pendingInstallments === 1 ? "" : "s"}
                            </div>
                          ) : (
                            <div className="mt-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                              100% saldado
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3.5 tabular-nums text-foreground">
                          {formatCOP(record.installmentValue)}
                        </td>
                        <td className="px-4 py-3.5 tabular-nums font-semibold text-foreground">
                          {formatCOP(record.pendingBalance)}
                        </td>
                        <td className="px-4 py-3.5 tabular-nums text-muted-foreground">
                          {record.firstLiberationDate ? (
                            <span className="font-medium text-foreground">
                              {formatDate(record.firstLiberationDate)}
                            </span>
                          ) : (
                            <span className="text-muted-foreground/70">—</span>
                          )}
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
    </div>
  );
}
