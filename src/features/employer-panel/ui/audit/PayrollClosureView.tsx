import { useMemo, useState } from "react";
import { ArrowRightLeft, Calculator, CheckCircle2, Eye, Receipt } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { AnimatedCurrency } from "@/components/ui/animated-number";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  buildPayrollClosureSnapshot,
  listPayrollClosureEmployeeAdvances,
  listPayrollClosureMonthOptions,
  monthKeyToReferenceDate,
  type EmployerPayrollDeductionSummary,
  type RegisteredCompanyAdvance,
} from "@/entities/employer-audit";
import { formatCOP } from "@/shared/lib";
import { downloadBrandedExcelReport } from "@/shared/lib/excelReport";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useEmployerPayrollClosure } from "../../model/useEmployerAuditData";
import { EmployerPanelUnavailableNotice } from "../EmployerPanelUnavailableNotice";
import { ExportReportButton } from "./ExportReportButton";
import { PayrollEmployeeAdvancesDialog } from "./PayrollEmployeeAdvancesDialog";

function currentMonthKey(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${now.getFullYear()}-${month}`;
}

function toDayKey(isoDate: string): string {
  return isoDate.slice(0, 10);
}

function TableSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, index) => (
        <Skeleton key={index} className="h-12 w-full rounded-lg" />
      ))}
    </div>
  );
}

export function PayrollClosureView() {
  const { data: advances, isLoading, isError } = useEmployerPayrollClosure();
  const [selectedMonth, setSelectedMonth] = useState(currentMonthKey);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [detailEmployee, setDetailEmployee] = useState<{
    name: string;
    document: string;
  } | null>(null);

  const monthOptions = useMemo(
    () => listPayrollClosureMonthOptions(advances ?? [], new Date()),
    [advances],
  );

  const filtersActive = Boolean(dateFrom || dateTo);

  const filteredAdvances = useMemo(() => {
    if (!advances) return [];
    return advances.filter((advance) => {
      const day = toDayKey(advance.requestedAt);
      if (dateFrom && day < dateFrom) return false;
      if (dateTo && day > dateTo) return false;
      return true;
    });
  }, [advances, dateFrom, dateTo]);

  const snapshot = useMemo(
    () =>
      buildPayrollClosureSnapshot(
        filteredAdvances,
        monthKeyToReferenceDate(selectedMonth),
      ),
    [filteredAdvances, selectedMonth],
  );

  const detailAdvances = useMemo((): RegisteredCompanyAdvance[] => {
    if (!detailEmployee) return [];
    return listPayrollClosureEmployeeAdvances(
      filteredAdvances,
      detailEmployee.document,
      monthKeyToReferenceDate(selectedMonth),
    );
  }, [detailEmployee, filteredAdvances, selectedMonth]);

  const handleMonthChange = (value: string) => {
    setSelectedMonth(value);
    setDateFrom("");
    setDateTo("");
  };

  const handleClearDateFilters = () => {
    setDateFrom("");
    setDateTo("");
  };

  const openEmployeeDetail = (summary: EmployerPayrollDeductionSummary) => {
    setDetailEmployee({
      name: summary.employeeName,
      document: summary.employeeDocument,
    });
  };

  const handleExport = async () => {
    if (!snapshot.employeeSummaries.length) {
      toast.info("No hay datos de nómina para exportar.");
      return;
    }

    try {
      await downloadBrandedExcelReport({
        filename: `retenciones-nomina-${snapshot.monthKey}`,
        sheetName: "Retenciones",
        brandDocument: "reporte",
        bannerDocument: "retenciones",
        headers: [
          "Empleado",
          "Documento",
          "Cantidad de adelantos",
          "Monto adelantado",
          "Comisión por cuota (informativa)",
          "Cuota a pagar este mes",
          "Valor a descontar por cuota",
          "Total a descontar",
          "Estado de pago",
        ],
        rows: snapshot.employeeSummaries.map((summary) => [
          summary.employeeName,
          summary.employeeDocument,
          summary.advancesCount,
          summary.principalTotal,
          summary.feesTotal,
          summary.installmentProgressLabel ?? "—",
          summary.loanInstallmentsTotal,
          summary.grandTotal,
          summary.statusLabel,
        ]),
        currencyColumnIndexes: [3, 4, 6, 7],
        columnWidths: [28, 16, 18, 18, 28, 20, 24, 18, 16],
        footerRows: [
          [
            "Total acumulado nómina",
            "",
            "",
            "",
            "",
            "",
            "",
            snapshot.totalPayrollDeductions,
            snapshot.isAllSettled ? "Paz y salvo" : "Pendiente",
          ],
          [
            "Total pendiente de liquidar",
            "",
            "",
            "",
            "",
            "",
            "",
            snapshot.totalPending,
            "",
          ],
          [
            "Reembolso proveedor",
            "",
            "",
            "",
            "",
            "",
            "",
            snapshot.providerReimbursement,
            snapshot.isAllSettled ? "Paz y salvo" : "Pendiente",
          ],
        ],
      });
      toast.success("Reporte Excel de nómina exportado correctamente.");
    } catch {
      toast.error("No se pudo exportar el reporte Excel.");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-36 rounded-xl" />
          <Skeleton className="h-36 rounded-xl" />
        </div>
        <TableSkeleton />
      </div>
    );
  }

  if (isError || !advances) {
    return (
      <EmployerPanelUnavailableNotice
        message="El cierre de nómina no está disponible en este momento."
        description="Esta sección se habilitará cuando haya información para mostrar."
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="relative overflow-hidden rounded-xl border border-border/80 bg-background p-5 shadow-sm sm:p-6">
          <Calculator className="pointer-events-none absolute -bottom-3 -right-2 sm:-bottom-4 sm:-right-3 h-20 w-20 sm:h-24 sm:w-24 md:h-28 md:w-28 text-primary/[0.04] dark:text-primary/[0.06]" strokeWidth={1.25} aria-hidden />
          <div className="relative mb-4 flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total pendiente a descontar en nómina
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {snapshot.isAllSettled
                  ? `Cuotas liberadas y saldadas con Super Admin — ${snapshot.monthLabel}`
                  : `Adelantos + comisiones + cuotas — ${snapshot.monthLabel}`}
              </p>
            </div>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-primary/15 bg-primary/10">
              <Calculator className="h-5 w-5 text-primary" strokeWidth={2.25} />
            </div>
          </div>
          <div className="relative flex items-baseline gap-3">
            <AnimatedCurrency
              value={snapshot.totalPending}
              className="font-display text-3xl font-bold text-gradient"
            />
            {snapshot.isAllSettled && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Paz y salvo
              </span>
            )}
          </div>
          {snapshot.totalPaid > 0 && (
            <p className="relative mt-2 text-xs text-muted-foreground">
              Total consolidado: {formatCOP(snapshot.totalPayrollDeductions)} · Saldado por liberación: {formatCOP(snapshot.totalPaid)}
            </p>
          )}
        </div>

        <div className="relative overflow-hidden rounded-xl border border-border/80 bg-background p-5 shadow-sm sm:p-6">
          <ArrowRightLeft className="pointer-events-none absolute -bottom-3 -right-2 sm:-bottom-4 sm:-right-3 h-20 w-20 sm:h-24 sm:w-24 md:h-28 md:w-28 text-primary/[0.04] dark:text-primary/[0.06]" strokeWidth={1.25} aria-hidden />
          <div className="relative mb-4 flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Monto de reembolso al proveedor
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {snapshot.isAllSettled
                  ? `Reembolso liquidado — La empresa está a paz y salvo con Cerebiia`
                  : `Pendiente de pago al proveedor para liberar cuotas`}
              </p>
            </div>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg sm:rounded-xl border border-[hsl(260_70%_50%)]/20 bg-[hsl(260_70%_50%)]/10">
              <ArrowRightLeft
                className="h-5 w-5 text-[hsl(260_70%_50%)]"
                strokeWidth={2.25}
              />
            </div>
          </div>
          <div className="relative flex items-baseline gap-3">
            <AnimatedCurrency
              value={snapshot.providerReimbursement}
              className="font-display text-3xl font-bold text-gradient"
            />
            {snapshot.isAllSettled && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Al día
              </span>
            )}
          </div>
          {snapshot.totalPaid > 0 && (
            <p className="relative mt-2 text-xs text-muted-foreground">
              Total reembolsado: {formatCOP(snapshot.totalPaid)}
            </p>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-border/80 bg-background p-4 shadow-sm sm:p-5">
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-display text-lg font-semibold text-foreground">
              Resumen por empleado
            </h3>
            <p className="text-sm text-muted-foreground">
              Listo para aplicar en la nómina de {snapshot.monthLabel}
            </p>
          </div>
          <ExportReportButton
            onClick={handleExport}
            label="Exportar nómina (Excel)"
          />
        </div>

        <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1.5">
            <Label htmlFor="payroll-filter-month">Mes</Label>
            <Select value={selectedMonth} onValueChange={handleMonthChange}>
              <SelectTrigger id="payroll-filter-month" className="h-10">
                <SelectValue placeholder="Seleccionar mes" />
              </SelectTrigger>
              <SelectContent>
                {monthOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
                {!monthOptions.some((option) => option.value === selectedMonth) ? (
                  <SelectItem value={selectedMonth}>
                    {snapshot.monthLabel}
                  </SelectItem>
                ) : null}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="payroll-filter-month-input">Mes (calendario)</Label>
            <Input
              id="payroll-filter-month-input"
              type="month"
              value={selectedMonth}
              onChange={(event) => handleMonthChange(event.target.value)}
              className="h-10"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="payroll-filter-from">Desde</Label>
            <Input
              id="payroll-filter-from"
              type="date"
              value={dateFrom}
              max={dateTo || undefined}
              onChange={(event) => setDateFrom(event.target.value)}
              className="h-10"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="payroll-filter-to">Hasta</Label>
            <div className="flex gap-2">
              <Input
                id="payroll-filter-to"
                type="date"
                value={dateTo}
                min={dateFrom || undefined}
                onChange={(event) => setDateTo(event.target.value)}
                className="h-10"
              />
              <Button
                type="button"
                variant="outline"
                disabled={!filtersActive}
                onClick={handleClearDateFilters}
                className={cn(
                  "h-10 shrink-0",
                  filtersActive
                    ? "border-border text-foreground"
                    : "text-muted-foreground",
                )}
              >
                Limpiar
              </Button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-border/80">
          <table className="w-full min-w-[1140px] text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/50 text-left">
                <th className="px-4 py-3 font-semibold text-muted-foreground">
                  Empleado
                </th>
                <th className="px-4 py-3 font-semibold text-muted-foreground">
                  Cantidad de adelantos
                </th>
                <th className="px-4 py-3 font-semibold text-muted-foreground">
                  Monto adelantado
                </th>
                <th className="px-4 py-3 font-semibold text-muted-foreground">
                  Comisión por cuota
                  <span className="mt-0.5 block text-[11px] font-normal normal-case tracking-normal text-muted-foreground/80">
                    Informativa · no suma al total
                  </span>
                </th>
                <th className="px-4 py-3 font-semibold text-muted-foreground">
                  Cuota a pagar este mes
                </th>
                <th className="px-4 py-3 font-semibold text-muted-foreground">
                  Valor a descontar por cuota
                </th>
                <th className="px-4 py-3 font-semibold text-muted-foreground">
                  Total a descontar
                </th>
                <th className="px-4 py-3 font-semibold text-muted-foreground">
                  Estado
                </th>
              </tr>
            </thead>
            <tbody>
              {snapshot.employeeSummaries.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-10 text-center text-sm text-muted-foreground"
                  >
                    No hay adelantos registrados en {snapshot.monthLabel}
                    {filtersActive ? " con los filtros de fecha aplicados" : ""}.
                    Los totales se calcularán automáticamente cuando tus
                    empleados soliciten adelantos.
                  </td>
                </tr>
              ) : (
                snapshot.employeeSummaries.map((summary) => (
                  <tr
                    key={summary.employeeDocument}
                    className="border-b border-border/70 last:border-0"
                  >
                    <td className="px-4 py-3.5">
                      <div className="flex items-start gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-foreground">
                            {summary.employeeName}
                          </div>
                          <div className="font-mono text-xs text-muted-foreground">
                            {summary.employeeDocument}
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 shrink-0 text-muted-foreground hover:text-primary"
                          onClick={() => openEmployeeDetail(summary)}
                          aria-label={`Ver detalle de adelantos de ${summary.employeeName}`}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 tabular-nums text-foreground">
                      {summary.advancesCount}
                    </td>
                    <td className="px-4 py-3.5 tabular-nums text-foreground">
                      {formatCOP(summary.principalTotal)}
                    </td>
                    <td className="px-4 py-3.5 tabular-nums text-muted-foreground">
                      {summary.feesTotal === 0
                        ? "Gratis"
                        : formatCOP(summary.feesTotal)}
                    </td>
                    <td className="px-4 py-3.5 text-foreground">
                      {summary.installmentProgressLabel ?? "—"}
                    </td>
                    <td className="px-4 py-3.5 tabular-nums text-foreground">
                      {formatCOP(summary.loanInstallmentsTotal)}
                    </td>
                    <td className="px-4 py-3.5 tabular-nums font-semibold text-foreground">
                      {formatCOP(summary.grandTotal)}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      {summary.isSettled ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Saldado
                        </span>
                      ) : summary.paidAmount > 0 ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
                          Parcial ({formatCOP(summary.paidAmount)} saldado)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-muted-foreground">
                          Pendiente
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            <tfoot>
              <tr className="border-t border-border bg-primary/[0.03]">
                <td
                  colSpan={6}
                  className="px-4 py-3.5 font-semibold text-foreground"
                >
                  <span className="inline-flex items-center gap-2">
                    <Receipt className="h-4 w-4 text-primary" />
                    Total consolidado del mes
                  </span>
                </td>
                <td className="px-4 py-3.5 font-display text-base font-bold text-gradient tabular-nums">
                  {formatCOP(snapshot.totalPayrollDeductions)}
                </td>
                <td className="px-4 py-3.5">
                  {snapshot.isAllSettled ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Paz y salvo
                    </span>
                  ) : null}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <PayrollEmployeeAdvancesDialog
        open={Boolean(detailEmployee)}
        onOpenChange={(open) => {
          if (!open) setDetailEmployee(null);
        }}
        employeeName={detailEmployee?.name ?? ""}
        employeeDocument={detailEmployee?.document ?? ""}
        monthLabel={snapshot.monthLabel}
        advances={detailAdvances}
      />
    </div>
  );
}
