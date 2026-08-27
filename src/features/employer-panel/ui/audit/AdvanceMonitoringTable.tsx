import { useMemo, useState } from "react";
import {
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Clock,
  ExternalLink,
  HelpCircle,
  Percent,
  Receipt,
  Search,
  ShieldAlert,
  SlidersHorizontal,
  Users,
  Wallet,
  XCircle,
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
import {
  calculateSalaryPercentage,
  calculateTotalWithholding,
  exceedsSalaryCap,
  type EmployerAdvanceAuditRecord,
} from "@/entities/employer-audit";
import { formatCOP, formatDate } from "@/shared/lib";
import { cn } from "@/lib/utils";
import { useEmployerAdvanceAudit } from "../../model/useEmployerAuditData";
import { useEmployerConfig } from "../../model/useEmployerConfig";
import { EmployerPanelUnavailableNotice } from "../EmployerPanelUnavailableNotice";
import { AuditComplianceBadge } from "./AuditComplianceBadge";
import { AuditStatusBadge } from "./AuditStatusBadge";
import { EmployerSolicitudDetalleDialog } from "./EmployerSolicitudDetalleDialog";

interface FilteredAdvanceItem {
  record: EmployerAdvanceAuditRecord;
  currentInstallmentNumber?: number;
  totalInstallments: number;
}

function extractMonthKey(isoDate: string): string {
  if (!isoDate) return "";
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return isoDate.slice(0, 7);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

function getRecordInstallmentPeriods(record: EmployerAdvanceAuditRecord): {
  monthKey: string;
  installmentNumber: number;
}[] {
  if (!record.processedAt) return [];
  const date = new Date(record.processedAt);
  if (Number.isNaN(date.getTime())) {
    return [{ monthKey: record.processedAt.slice(0, 7), installmentNumber: 1 }];
  }

  const startYear = date.getFullYear();
  const startMonth = date.getMonth();
  const totalInstallments = Math.max(1, record.installments || 1);

  const result: { monthKey: string; installmentNumber: number }[] = [];

  for (let i = 0; i < totalInstallments; i++) {
    const installmentDate = new Date(startYear, startMonth + i, 1);
    const y = installmentDate.getFullYear();
    const m = String(installmentDate.getMonth() + 1).padStart(2, "0");
    result.push({
      monthKey: `${y}-${m}`,
      installmentNumber: i + 1,
    });
  }

  return result;
}

function formatPeriodOptionLabel(periodKey: string): string {
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

function filterRecords(
  records: EmployerAdvanceAuditRecord[],
  query: string,
  period: string,
): FilteredAdvanceItem[] {
  const normalized = query.trim().toLowerCase();
  const results: FilteredAdvanceItem[] = [];

  for (const record of records) {
    if (normalized) {
      const matchName = record.employeeName.toLowerCase().includes(normalized);
      const matchDoc = record.employeeDocument.includes(normalized);
      if (!matchName && !matchDoc) continue;
    }

    const totalInstallments = Math.max(1, record.installments || 1);

    if (!period || period === "all") {
      results.push({
        record,
        totalInstallments,
      });
    } else {
      const installmentPeriods = getRecordInstallmentPeriods(record);
      const match = installmentPeriods.find((p) => p.monthKey === period);
      if (match) {
        results.push({
          record,
          currentInstallmentNumber: match.installmentNumber,
          totalInstallments,
        });
      }
    }
  }

  return results;
}

function isCuotaDescontada(
  record: EmployerAdvanceAuditRecord,
  installmentNumber: number = 1,
): boolean {
  if (record.status === "rechazado") return false;
  if (record.cuotas && record.cuotas.length > 0) {
    const target = record.cuotas.find((c) => c.numero === installmentNumber);
    if (target) {
      const st = (target.estado || "").toLowerCase();
      return (
        st === "pagada" ||
        st === "liberada" ||
        st === "descontada" ||
        target.fecha_pago != null
      );
    }
  }
  return Boolean(record.isPaid);
}

function RetencionStatusBadge({ isDiscounted }: { isDiscounted: boolean }) {
  if (isDiscounted) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/30 bg-rose-500/10 px-2.5 py-1 text-xs font-semibold text-rose-500 dark:text-rose-400">
        <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
        Descontado
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-500 dark:text-emerald-400">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
      No descontado
    </span>
  );
}

function getStatusLabel(status: EmployerAdvanceAuditRecord["status"]): string {
  if (status === "procesado") return "Pagado";
  if (status === "en_curso") return "En curso";
  return "Rechazado";
}

function getStatusTone(
  status: EmployerAdvanceAuditRecord["status"],
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

export function AdvanceMonitoringTable() {
  const [search, setSearch] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState<string>("all");
  const [selectedSolicitud, setSelectedSolicitud] = useState<{
    id: string;
    employeeName: string;
  } | null>(null);
  const { data, isLoading, isError } = useEmployerAdvanceAudit();
  const { data: adelantoConfig } = useEmployerConfig();

  // Opciones de periodos disponibles (incluye meses presentes y meses futuros de cuotas pendientes)
  const periodOptions = useMemo(() => {
    const months = new Set<string>();
    const now = new Date();
    const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    months.add(currentMonthKey);

    (data ?? []).forEach((record) => {
      const periods = getRecordInstallmentPeriods(record);
      periods.forEach((p) => months.add(p.monthKey));
    });

    // Orden cronológico (meses más recientes y futuros accesibles)
    return Array.from(months).sort((a, b) => b.localeCompare(a));
  }, [data]);

  const filteredRecords = useMemo(
    () => filterRecords(data ?? [], search, selectedPeriod),
    [data, search, selectedPeriod],
  );

  const complianceAlerts = useMemo(
    () =>
      filteredRecords.filter((item) =>
        exceedsSalaryCap(item.record.advancedAmount, item.record.baseSalary),
      ).length,
    [filteredRecords],
  );

  // Totales calculados dinámicamente: solo suma cuotas en estado "No descontado" (pendientes)
  const totalDescontar = useMemo(
    () =>
      filteredRecords.reduce((sum, item) => {
        const isDiscounted = isCuotaDescontada(
          item.record,
          item.currentInstallmentNumber ?? 1,
        );
        if (isDiscounted) return sum;

        return (
          sum +
          calculateTotalWithholding(
            item.record.advancedAmount,
            item.record.status,
            item.totalInstallments,
            selectedPeriod !== "all",
          )
        );
      }, 0),
    [filteredRecords, selectedPeriod],
  );

  const totalSolicitado = useMemo(
    () =>
      filteredRecords.reduce(
        (sum, item) =>
          sum +
          (item.record.status !== "rechazado"
            ? selectedPeriod === "all"
              ? item.record.advancedAmount
              : Math.round(item.record.advancedAmount / item.totalInstallments)
            : 0),
        0,
      ),
    [filteredRecords, selectedPeriod],
  );

  const totalEmpleadosImpactados = useMemo(
    () =>
      new Set(filteredRecords.map((item) => item.record.employeeDocument)).size,
    [filteredRecords],
  );

  const tarifaPorCuotaLabel = adelantoConfig
    ? formatCOP(adelantoConfig.tarifaFijaPorCuota)
    : null;

  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const hasActiveFilters = Boolean(search || selectedPeriod !== "all");

  return (
    <div className="space-y-6">
      {/* Cards informativas resumidas del periodo y búsqueda activa */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="glass-card glow-border relative overflow-hidden rounded-xl p-5">
          <Receipt className="pointer-events-none absolute -bottom-3 -right-2 sm:-bottom-4 sm:-right-3 h-20 w-20 sm:h-24 sm:w-24 md:h-28 md:w-28 text-primary/[0.04] dark:text-primary/[0.06]" strokeWidth={1.25} aria-hidden />
          <div className="relative mb-3 flex items-center justify-between gap-2">
            <p className="text-xs uppercase font-semibold tracking-wider text-muted-foreground">
              Total a descontar en nómina
            </p>
            <div className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Receipt className="h-4 w-4" />
            </div>
          </div>
          <div className="relative">
            <AnimatedCurrency
              value={totalDescontar}
              className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-foreground"
            />
          </div>
          <p className="relative mt-1 text-xs text-muted-foreground">
            {totalDescontar === 0
              ? selectedPeriod === "all"
                ? "Al día — Todos los adelantos han sido descontados"
                : `Al día — No hay descuentos pendientes en ${formatPeriodOptionLabel(selectedPeriod)}`
              : selectedPeriod === "all"
                ? "Retenciones pendientes por liquidar"
                : `Pendiente por descontar en ${formatPeriodOptionLabel(selectedPeriod)}`}
          </p>
        </div>

        <div className="glass-card glow-border relative overflow-hidden rounded-xl p-5">
          <Wallet className="pointer-events-none absolute -bottom-3 -right-2 sm:-bottom-4 sm:-right-3 h-20 w-20 sm:h-24 sm:w-24 md:h-28 md:w-28 text-primary/[0.04] dark:text-primary/[0.06]" strokeWidth={1.25} aria-hidden />
          <div className="relative mb-3 flex items-center justify-between gap-2">
            <p className="text-xs uppercase font-semibold tracking-wider text-muted-foreground">
              Total solicitado
            </p>
            <div className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
              <Wallet className="h-4 w-4" />
            </div>
          </div>
          <div className="relative">
            <AnimatedCurrency
              value={totalSolicitado}
              className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-foreground"
            />
          </div>
          <p className="relative mt-1 text-xs text-muted-foreground">
            {selectedPeriod === "all"
              ? "Monto principal acumulado"
              : `Cuotas a amortizar en ${formatPeriodOptionLabel(selectedPeriod)}`}
          </p>
        </div>

        <div className="sm:col-span-2 lg:col-span-1 glass-card glow-border relative overflow-hidden rounded-xl p-5">
          <Users className="pointer-events-none absolute -bottom-3 -right-2 sm:-bottom-4 sm:-right-3 h-20 w-20 sm:h-24 sm:w-24 md:h-28 md:w-28 text-primary/[0.04] dark:text-primary/[0.06]" strokeWidth={1.25} aria-hidden />
          <div className="relative mb-3 flex items-center justify-between gap-2">
            <p className="text-xs uppercase font-semibold tracking-wider text-muted-foreground">
              Adelantos auditados
            </p>
            <div className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="relative flex items-baseline gap-2">
            <span className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              {filteredRecords.length}
            </span>
            <span className="text-xs font-medium text-muted-foreground">
              {selectedPeriod === "all"
                ? `solicitud${filteredRecords.length === 1 ? "" : "es"}`
                : `cuota${filteredRecords.length === 1 ? "" : "s"} activa${filteredRecords.length === 1 ? "" : "s"}`}
            </span>
          </div>
          <p className="relative mt-1 text-xs text-muted-foreground">
            {totalEmpleadosImpactados} empleado{totalEmpleadosImpactados === 1 ? "" : "s"} registrado{totalEmpleadosImpactados === 1 ? "" : "s"} en el filtro
          </p>
        </div>
      </div>

      <div className="glass-card glow-border rounded-xl p-4 sm:p-5">
        {/* Botón de Filtros en Móvil */}
        <div className="mb-4 flex items-center justify-between sm:hidden">
          <button
            type="button"
            onClick={() => setIsFiltersOpen((prev) => !prev)}
            className="inline-flex items-center gap-2 rounded-xl border border-border/80 bg-background/80 px-3.5 py-2 text-xs font-semibold text-foreground shadow-sm"
          >
            <SlidersHorizontal className="h-3.5 w-3.5 text-primary" />
            <span>Filtros</span>
            {hasActiveFilters && (
              <span className="h-2 w-2 rounded-full bg-primary" aria-hidden />
            )}
            {isFiltersOpen ? (
              <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            )}
          </button>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setSelectedPeriod("all");
              }}
              className="text-xs font-medium text-muted-foreground hover:text-foreground hover:underline"
            >
              Restablecer
            </button>
          )}
        </div>

        {/* Barra de Filtros: Buscador por texto + Selector de Periodo */}
        <div
          className={cn(
            "mb-5 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
            isFiltersOpen ? "flex" : "hidden sm:flex",
          )}
        >
          <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1 sm:max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por empleado o documento..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="h-11 rounded-xl border-border/80 bg-background/80 pl-10"
                disabled={isLoading}
              />
            </div>

            <div className="w-full sm:w-56">
              <Select
                value={selectedPeriod}
                onValueChange={setSelectedPeriod}
                disabled={isLoading}
              >
                <SelectTrigger className="h-11 rounded-xl border-border/80 bg-background/80">
                  <div className="flex items-center gap-2 text-foreground">
                    <Calendar className="h-4 w-4 shrink-0 text-primary" />
                    <SelectValue placeholder="Seleccionar periodo" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los periodos</SelectItem>
                  {periodOptions.map((period) => (
                    <SelectItem key={period} value={period}>
                      {formatPeriodOptionLabel(period)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {complianceAlerts > 0 ? (
            <div className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              <ShieldAlert className="h-4 w-4 shrink-0" />
              <span>
                {complianceAlerts} alerta{complianceAlerts === 1 ? "" : "s"} de
                cumplimiento
              </span>
            </div>
          ) : null}
        </div>

        {isLoading ? <TableSkeleton /> : null}

        {isError ? (
          <EmployerPanelUnavailableNotice
            message="No pudimos cargar el monitoreo de adelantos."
            description="Verifica tu conexión con el servidor e intenta recargar la página."
          />
        ) : null}

        {!isLoading && !isError ? (
          <div className="overflow-x-auto rounded-xl border border-border/80">
            <table className="w-full min-w-[1080px] text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/50 text-left">
                  <th className="px-4 py-3 font-semibold text-muted-foreground">
                    Empleado
                  </th>
                  <th className="px-4 py-3 font-semibold text-muted-foreground">
                    Salario mensual
                  </th>
                  <th className="px-4 py-3 font-semibold text-muted-foreground">
                    Valor solicitado
                  </th>
                  <th className="px-4 py-3 font-semibold text-muted-foreground">
                    % usado del salario
                  </th>
                  <th className="px-4 py-3 font-semibold text-muted-foreground">
                    Comisión
                  </th>
                  <th className="px-4 py-3 font-semibold text-muted-foreground">
                    {selectedPeriod === "all"
                      ? "Total a descontar en nómina"
                      : "A descontar en nómina (mes)"}
                  </th>
                  <th className="px-4 py-3 font-semibold text-muted-foreground">
                    Cuotas de pago
                  </th>
                  <th className="px-4 py-3 font-semibold text-muted-foreground">
                    Retención en nómina
                  </th>
                  <th className="px-4 py-3 font-semibold text-muted-foreground">
                    Estado del adelanto
                  </th>
                  <th className="px-4 py-3 font-semibold text-muted-foreground">
                    Fecha de solicitud
                  </th>
                  <th className="px-4 py-3 font-semibold text-muted-foreground">
                    Detalle
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="px-4 py-10 text-center">
                      <div className="mx-auto flex max-w-sm flex-col items-center gap-2 text-muted-foreground">
                        <ClipboardCheck className="h-8 w-8 opacity-60" />
                        <p className="text-sm">
                          {search.trim() || selectedPeriod !== "all"
                            ? "No hay adelantos que coincidan con los filtros aplicados."
                            : "Aún no hay adelantos registrados. Aparecerán aquí cuando tus empleados soliciten un adelanto."}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((item) => {
                    const { record, currentInstallmentNumber, totalInstallments } =
                      item;
                    const salaryPct = calculateSalaryPercentage(
                      record.advancedAmount,
                      record.baseSalary,
                    );
                    const hasComplianceAlert = exceedsSalaryCap(
                      record.advancedAmount,
                      record.baseSalary,
                    );
                    const totalWithholding = calculateTotalWithholding(
                      record.advancedAmount,
                      record.status,
                      totalInstallments,
                      selectedPeriod !== "all",
                    );
                    const isDiscounted = isCuotaDescontada(
                      record,
                      currentInstallmentNumber ?? 1,
                    );

                    return (
                      <tr
                        key={`${record.id}-${currentInstallmentNumber ?? 0}`}
                        className={cn(
                          "border-b border-border/70 last:border-0",
                          hasComplianceAlert && "bg-destructive/[0.04]",
                        )}
                      >
                        <td className="px-4 py-3.5">
                          <div className="font-medium text-foreground">
                            {record.employeeName}
                          </div>
                          <div className="font-mono text-xs text-muted-foreground">
                            {record.employeeDocument}
                          </div>
                          {hasComplianceAlert ? (
                            <div className="mt-2">
                              <AuditComplianceBadge />
                            </div>
                          ) : null}
                        </td>
                        <td className="px-4 py-3.5 tabular-nums text-foreground">
                          {formatCOP(record.baseSalary)}
                        </td>
                        <td className="px-4 py-3.5 tabular-nums font-medium text-foreground">
                          {formatCOP(record.advancedAmount)}
                        </td>
                        <td className="px-4 py-3.5">
                          <span
                            className={cn(
                              "tabular-nums font-semibold",
                              hasComplianceAlert
                                ? "text-destructive"
                                : "text-foreground",
                            )}
                          >
                            {salaryPct.toFixed(1)}%
                          </span>
                        </td>
                        <td className="px-4 py-3.5 tabular-nums text-muted-foreground">
                          {formatCOP(record.feeAmount)}
                          <p className="mt-0.5 text-[11px] text-muted-foreground/80">
                            Descontada al empleado
                          </p>
                        </td>
                        <td className="px-4 py-3.5 tabular-nums font-semibold text-foreground">
                          {formatCOP(totalWithholding)}
                          {selectedPeriod !== "all" && totalInstallments > 1 ? (
                            <p className="mt-0.5 text-[11px] font-normal text-muted-foreground">
                              Cuota {currentInstallmentNumber ?? 1} de{" "}
                              {totalInstallments} (Total:{" "}
                              {formatCOP(record.advancedAmount)})
                            </p>
                          ) : null}
                        </td>
                        <td className="px-4 py-3.5 text-foreground">
                          {totalInstallments}{" "}
                          {totalInstallments === 1 ? "cuota" : "cuotas"}
                        </td>
                        <td className="px-4 py-3.5">
                          <RetencionStatusBadge isDiscounted={isDiscounted} />
                        </td>
                        <td className="px-4 py-3.5">
                          <AuditStatusBadge
                            label={getStatusLabel(record.status)}
                            tone={getStatusTone(record.status)}
                          />
                        </td>
                        <td className="px-4 py-3.5 text-muted-foreground">
                          {formatDate(record.processedAt)}
                        </td>
                        <td className="px-4 py-3.5">
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedSolicitud({
                                id: record.id,
                                employeeName: record.employeeName,
                              })
                            }
                            className="text-xs font-medium text-primary transition-colors hover:text-primary/80"
                          >
                            Ver detalle
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        ) : null}

        <EmployerSolicitudDetalleDialog
          solicitudId={selectedSolicitud?.id ?? null}
          employeeName={selectedSolicitud?.employeeName}
          open={selectedSolicitud !== null}
          onOpenChange={(open) => {
            if (!open) setSelectedSolicitud(null);
          }}
        />

        {!isLoading && !isError && data ? (
          <p className="mt-4 text-xs text-muted-foreground">
            {filteredRecords.length} de {data.length} registro
            {data.length === 1 ? "" : "s"} mostrado
            {filteredRecords.length === 1 ? "" : "s"}.{" "}
            {tarifaPorCuotaLabel
              ? `La comisión fija de ${tarifaPorCuotaLabel} por cuota se descuenta al empleado en el desembolso`
              : "La comisión configurada se descuenta al empleado en el desembolso"}
            ; la empresa solo retiene el valor solicitado. Tope permitido:{" "}
            {adelantoConfig
              ? `${adelantoConfig.porcentajeMaximoAdelanto}%`
              : "30%"}{" "}
            del salario mensual.
          </p>
        ) : null}
      </div>
    </div>
  );
}
