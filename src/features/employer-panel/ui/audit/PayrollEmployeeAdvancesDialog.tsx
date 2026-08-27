import { useMemo, useState } from "react";
import {
  Building2,
  Calendar,
  Coins,
  FileSpreadsheet,
  Layers,
  Receipt,
  Search,
  User,
  Users,
  Wallet,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AnimatedCurrency } from "@/components/ui/animated-number";
import { AdvancePaymentEvidenceDialog } from "@/features/advance/ui/AdvancePaymentEvidenceDialog";
import {
  getAdvanceInstallmentMonthOffset,
  getMonthKey,
  monthKeyToReferenceDate,
  type RegisteredCompanyAdvance,
} from "@/entities/employer-audit";
import { formatCOP, formatDate } from "@/shared/lib";
import { downloadBrandedExcelReport } from "@/shared/lib/excelReport";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type PayrollEmployeeAdvancesDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employeeName: string;
  employeeDocument: string;
  monthLabel: string;
  advances: RegisteredCompanyAdvance[];
};

interface CuotaRowItem {
  id: string;
  advanceId: string;
  employeeName: string;
  employeeDocument: string;
  totalAdvanceAmount: number;
  totalInstallments: number;
  paidInstallmentsCount: number;
  currentInstallmentNumber: number;
  progressPct: number;
  feeAmount: number;
  monthlyInstallmentValue: number;
  monthlyDeductionPending: number;
  isCuotaPaid: boolean;
  requestedAt: string;
  paymentEvidenceUrl: string | null;
}

export function PayrollEmployeeAdvancesDialog({
  open,
  onOpenChange,
  employeeName,
  employeeDocument,
  monthLabel,
  advances,
}: PayrollEmployeeAdvancesDialogProps) {
  const [search, setSearch] = useState("");
  const [viewTab, setViewTab] = useState<"individual" | "consolidated">(
    "individual",
  );
  const [evidenceUrl, setEvidenceUrl] = useState<string | null>(null);

  // Mapeo detallado de cada cuota/adelanto correspondiente al periodo activo
  const cuotaRows = useMemo((): CuotaRowItem[] => {
    return advances.map((advance) => {
      const planTotal = Math.max(1, advance.installments);
      const monthlyValue = Math.round(advance.advancedAmount / planTotal);

      let paidCount = 0;
      let isCuotaPaid = false;

      if (Array.isArray(advance.cuotas) && advance.cuotas.length > 0) {
        paidCount = advance.cuotas.filter((c) => {
          const st = String(c.estado || "").toLowerCase().trim();
          return (
            st === "pagado" ||
            st === "pagada" ||
            st === "liberado" ||
            st === "liberada" ||
            Boolean(c.fecha_pago)
          );
        }).length;

        // Se evalúa la cuota correspondiente a este mes (o cuota 1 si es solicitud directa)
        const cuota1 = advance.cuotas.find((c) => c.numero === 1) ?? advance.cuotas[0];
        const st1 = String(cuota1.estado || "").toLowerCase().trim();
        isCuotaPaid =
          st1 === "pagado" ||
          st1 === "pagada" ||
          st1 === "liberado" ||
          st1 === "liberada" ||
          Boolean(cuota1.fecha_pago);
      } else {
        paidCount = advance.isPaid ? planTotal : 0;
        isCuotaPaid = Boolean(advance.isPaid);
      }

      const progressPct = Math.round((paidCount / planTotal) * 100);
      const fee = advance.feeAmount ?? 0;
      const monthlyDeductionPending = isCuotaPaid ? 0 : monthlyValue;

      return {
        id: advance.id,
        advanceId: advance.id,
        employeeName: advance.employeeName,
        employeeDocument: advance.employeeDocument,
        totalAdvanceAmount: advance.advancedAmount,
        totalInstallments: planTotal,
        paidInstallmentsCount: paidCount,
        currentInstallmentNumber: Math.min(planTotal, paidCount + (isCuotaPaid ? 0 : 1)),
        progressPct,
        feeAmount: fee,
        monthlyInstallmentValue: monthlyValue,
        monthlyDeductionPending,
        isCuotaPaid,
        requestedAt: advance.requestedAt,
        paymentEvidenceUrl: advance.paymentEvidenceUrl,
      };
    });
  }, [advances]);

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return cuotaRows;
    return cuotaRows.filter(
      (r) =>
        r.employeeName.toLowerCase().includes(q) ||
        r.employeeDocument.includes(q) ||
        String(r.totalAdvanceAmount).includes(q) ||
        String(r.monthlyInstallmentValue).includes(q),
    );
  }, [cuotaRows, search]);

  // Métricas para las cards superiores
  const totalCobrarEsteMes = useMemo(
    () => filteredRows.reduce((sum, r) => sum + r.monthlyDeductionPending, 0),
    [filteredRows],
  );

  const totalSolicitado = useMemo(
    () => filteredRows.reduce((sum, r) => sum + r.totalAdvanceAmount, 0),
    [filteredRows],
  );

  const handleExportExcel = async () => {
    if (!filteredRows.length) {
      toast.info("No hay información para exportar.");
      return;
    }

    try {
      await downloadBrandedExcelReport({
        filename: `detalle-adelantos-${employeeDocument}-${monthLabel.replace(/\s+/g, "_")}`,
        sheetName: "Adelantos",
        brandDocument: "reporte",
        bannerDocument: "movimientos",
        headers: [
          "Empleado",
          "Documento",
          "Cuotas pagadas",
          "Monto total adelanto",
          "Descuento este mes",
          "Tarifa fija",
          "Estado cuota",
          "Fecha de solicitud",
        ],
        rows: filteredRows.map((r) => [
          r.employeeName,
          r.employeeDocument,
          `${r.paidInstallmentsCount} de ${r.totalInstallments}`,
          r.totalAdvanceAmount,
          r.monthlyDeductionPending,
          r.feeAmount,
          r.isCuotaPaid ? "Pagada" : "Pendiente",
          formatDate(r.requestedAt),
        ]),
        currencyColumnIndexes: [3, 4, 5],
        columnWidths: [28, 16, 18, 22, 22, 16, 16, 20],
      });
      toast.success("Excel de nómina exportado correctamente.");
    } catch {
      toast.error("No se pudo exportar el reporte Excel.");
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[92vh] max-w-5xl overflow-y-auto rounded-2xl p-6 sm:p-7">
          <DialogHeader className="space-y-3 text-left">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-[hsl(260_70%_50%)] text-primary-foreground shadow-md shadow-primary/20">
                <Receipt className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <DialogTitle className="font-display text-xl font-bold tracking-tight text-foreground">
                    Adelantos y Cuotas a Cobrar
                  </DialogTitle>
                  <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-0.5 text-xs font-semibold text-primary">
                    {monthLabel}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Desglose de nómina, cuotas amortizadas y saldos activos para la
                  empresa en este periodo.
                </p>
              </div>
            </div>

            {/* Sub-información de Empresa / Empleado y Periodo de corte */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/70 pt-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-2 font-medium text-foreground">
                <Building2 className="h-4 w-4 text-primary" />
                <span>
                  {employeeName}{" "}
                  <span className="text-muted-foreground font-normal">
                    (CC: {employeeDocument})
                  </span>
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-primary" />
                <span>
                  Periodo de corte:{" "}
                  <strong className="text-foreground">{monthLabel}</strong>
                </span>
              </div>
            </div>
          </DialogHeader>

          {/* 4 Cards Superiores de Resumen */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            <div className="relative overflow-hidden rounded-xl border border-primary/20 bg-primary/[0.03] p-4 shadow-sm">
              <Wallet className="pointer-events-none absolute -bottom-3 -right-2 sm:-bottom-4 sm:-right-3 h-16 w-16 sm:h-20 sm:w-20 text-primary/[0.04] dark:text-primary/[0.06]" strokeWidth={1.25} aria-hidden />
              <div className="relative flex items-center justify-between text-xs font-medium text-primary">
                <span className="uppercase tracking-wider">Total a cobrar</span>
                <Wallet className="h-4 w-4" />
              </div>
              <div className="relative mt-2">
                <AnimatedCurrency
                  value={totalCobrarEsteMes}
                  className="font-display text-2xl font-bold tracking-tight text-primary"
                />
              </div>
            </div>

            <div className="relative overflow-hidden rounded-xl border border-border/80 bg-background/80 p-4 shadow-sm">
              <Coins className="pointer-events-none absolute -bottom-3 -right-2 sm:-bottom-4 sm:-right-3 h-16 w-16 sm:h-20 sm:w-20 text-primary/[0.04] dark:text-primary/[0.06]" strokeWidth={1.25} aria-hidden />
              <div className="relative flex items-center justify-between text-xs font-medium text-muted-foreground">
                <span className="uppercase tracking-wider">Total solicitado</span>
                <Coins className="h-4 w-4 text-emerald-500" />
              </div>
              <div className="relative mt-2">
                <AnimatedCurrency
                  value={totalSolicitado}
                  className="font-display text-2xl font-bold tracking-tight text-foreground"
                />
              </div>
            </div>

            <div className="relative overflow-hidden rounded-xl border border-border/80 bg-background/80 p-4 shadow-sm">
              <Users className="pointer-events-none absolute -bottom-3 -right-2 sm:-bottom-4 sm:-right-3 h-16 w-16 sm:h-20 sm:w-20 text-primary/[0.04] dark:text-primary/[0.06]" strokeWidth={1.25} aria-hidden />
              <div className="relative flex items-center justify-between text-xs font-medium text-muted-foreground">
                <span className="uppercase tracking-wider">Adelantos</span>
                <Users className="h-4 w-4 text-blue-500" />
              </div>
              <div className="relative mt-2 font-display text-2xl font-bold tracking-tight text-foreground">
                {filteredRows.length}
              </div>
            </div>

            <div className="relative overflow-hidden rounded-xl border border-border/80 bg-background/80 p-4 shadow-sm">
              <Layers className="pointer-events-none absolute -bottom-3 -right-2 sm:-bottom-4 sm:-right-3 h-16 w-16 sm:h-20 sm:w-20 text-primary/[0.04] dark:text-primary/[0.06]" strokeWidth={1.25} aria-hidden />
              <div className="relative flex items-center justify-between text-xs font-medium text-muted-foreground">
                <span className="uppercase tracking-wider">Cuotas periodo</span>
                <Layers className="h-4 w-4 text-purple-500" />
              </div>
              <div className="relative mt-2 font-display text-2xl font-bold tracking-tight text-foreground">
                {filteredRows.reduce((sum, r) => sum + r.totalInstallments, 0)}
              </div>
            </div>
          </div>

          {/* Barra de Filtros: Pestañas + Buscador + Botón Excel */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="inline-flex rounded-xl border border-border/80 bg-secondary/30 p-1 text-xs">
              <button
                type="button"
                onClick={() => setViewTab("individual")}
                className={cn(
                  "rounded-lg px-3 py-1.5 font-medium transition-all",
                  viewTab === "individual"
                    ? "bg-background font-semibold text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                Por cuota individual ({cuotaRows.length})
              </button>
              <button
                type="button"
                onClick={() => setViewTab("consolidated")}
                className={cn(
                  "rounded-lg px-3 py-1.5 font-medium transition-all",
                  viewTab === "consolidated"
                    ? "bg-background font-semibold text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                Consolidado ({advances.length})
              </button>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative max-w-xs flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar adelanto o monto..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-9 rounded-xl border-border/80 bg-background/80 pl-9 text-xs"
                />
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleExportExcel}
                className="h-9 rounded-xl border-emerald-500/30 bg-emerald-500/10 text-xs font-semibold text-emerald-600 hover:bg-emerald-500/20 dark:text-emerald-400"
              >
                <FileSpreadsheet className="mr-1.5 h-3.5 w-3.5" />
                Excel nómina
              </Button>
            </div>
          </div>

          {/* Tabla estilizada exactamente como la referencia */}
          <div className="overflow-x-auto rounded-2xl border border-border/80 bg-background shadow-sm">
            <table className="w-full min-w-[840px] text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/40 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-3.5">Empleado</th>
                  <th className="px-4 py-3.5">Documento</th>
                  <th className="px-4 py-3.5 text-center">Cuotas pagadas</th>
                  <th className="px-4 py-3.5">Monto total adelanto</th>
                  <th className="px-4 py-3.5">Descuento este mes</th>
                  <th className="px-4 py-3.5">Tarifa fija</th>
                  <th className="px-4 py-3.5 text-center">Estado cuota</th>
                  <th className="px-4 py-3.5 text-right">Evidencia</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-4 py-10 text-center text-sm text-muted-foreground"
                    >
                      No se encontraron cuotas o adelantos para los filtros
                      aplicados.
                    </td>
                  </tr>
                ) : (
                  filteredRows.map((row) => (
                    <tr
                      key={row.id}
                      className="border-b border-border/70 last:border-0 hover:bg-secondary/15 transition-colors"
                    >
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">
                            <User className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="font-semibold text-foreground">
                              {row.employeeName}
                            </div>
                            <div className="text-[11px] text-muted-foreground">
                              Solicitado el {formatDate(row.requestedAt)}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3.5 font-mono text-xs text-muted-foreground">
                        {row.employeeDocument}
                      </td>

                      <td className="px-4 py-3.5 text-center">
                        <div className="inline-flex flex-col items-center">
                          <span className="text-xs font-semibold text-foreground">
                            {row.paidInstallmentsCount} de {row.totalInstallments}
                          </span>
                          <div className="mt-1 h-1.5 w-24 overflow-hidden rounded-full bg-secondary">
                            <div
                              className={cn(
                                "h-full rounded-full transition-all",
                                row.progressPct === 100
                                  ? "bg-emerald-500"
                                  : row.progressPct > 0
                                    ? "bg-gradient-to-r from-primary to-[hsl(260_70%_50%)]"
                                    : "bg-amber-500",
                              )}
                              style={{ width: `${Math.max(5, row.progressPct)}%` }}
                            />
                          </div>
                          <span
                            className={cn(
                              "mt-0.5 text-[10px] font-medium",
                              row.progressPct === 100
                                ? "text-emerald-600 dark:text-emerald-400"
                                : row.progressPct > 0
                                  ? "text-primary"
                                  : "text-amber-600 dark:text-amber-400",
                            )}
                          >
                            {row.progressPct === 100
                              ? "100% saldado"
                              : row.progressPct > 0
                                ? `${row.progressPct}% saldado`
                                : "0% saldado (Pendiente)"}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-3.5 tabular-nums font-medium text-foreground">
                        {formatCOP(row.totalAdvanceAmount)}
                      </td>

                      <td className="px-4 py-3.5 tabular-nums font-semibold">
                        {row.isCuotaPaid ? (
                          <span className="text-muted-foreground">$ 0</span>
                        ) : (
                          <span className="text-primary">
                            {formatCOP(row.monthlyDeductionPending)}
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3.5 tabular-nums text-muted-foreground">
                        {row.feeAmount === 0 ? "$ 0" : formatCOP(row.feeAmount)}
                      </td>

                      <td className="px-4 py-3.5 text-center">
                        {row.isCuotaPaid ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            Pagada
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                            Pendiente
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3.5 text-right">
                        {row.paymentEvidenceUrl ? (
                          <button
                            type="button"
                            onClick={() => setEvidenceUrl(row.paymentEvidenceUrl)}
                            className="text-xs font-medium text-primary hover:underline"
                          >
                            Ver evidencia
                          </button>
                        ) : (
                          <span className="text-xs text-muted-foreground/60">
                            —
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Footer con conteo y botón Cerrar morado */}
          <div className="flex items-center justify-between border-t border-border/70 pt-3 text-xs text-muted-foreground">
            <span>
              {filteredRows.length} cuota(s) registradas en{" "}
              <strong className="text-foreground">{monthLabel}</strong>
            </span>

            <Button
              type="button"
              onClick={() => onOpenChange(false)}
              className="h-10 rounded-xl bg-gradient-to-r from-primary to-[hsl(260_70%_50%)] px-6 font-semibold text-primary-foreground shadow-md shadow-primary/20 hover:opacity-95"
            >
              Cerrar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AdvancePaymentEvidenceDialog
        open={Boolean(evidenceUrl)}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) setEvidenceUrl(null);
        }}
        evidenceUrl={evidenceUrl}
      />
    </>
  );
}
