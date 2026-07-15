import { ArrowRightLeft, Calculator, Receipt } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { AnimatedCurrency } from "@/components/ui/animated-number";
import { formatCOP } from "@/shared/lib";
import { downloadCsvFile } from "@/shared/lib/csv";
import { toast } from "sonner";
import { useEmployerPayrollClosure } from "../../model/useEmployerAuditData";
import { EmployerPanelUnavailableNotice } from "../EmployerPanelUnavailableNotice";
import { ExportReportButton } from "./ExportReportButton";

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
  const { data, isLoading, isError } = useEmployerPayrollClosure();

  const handleExport = () => {
    if (!data?.employeeSummaries.length) {
      toast.info("No hay datos de nómina para exportar.");
      return;
    }

    const rows: (string | number)[][] = [
      [
        "Empleado",
        "Documento",
        "Adelantos",
        "Comisiones",
        "Cuotas préstamo",
        "Total a descontar",
      ],
      ...data.employeeSummaries.map((summary) => [
        summary.employeeName,
        summary.employeeDocument,
        summary.advancesTotal,
        summary.feesTotal,
        summary.loanInstallmentsTotal,
        summary.grandTotal,
      ]),
      [],
      ["Total acumulado nómina", "", "", "", "", data.totalPayrollDeductions],
      ["Reembolso proveedor", "", "", "", "", data.providerReimbursement],
    ];

    downloadCsvFile(`retenciones-nomina-${data.monthLabel.toLowerCase()}`, rows);
    toast.success("Reporte de nómina exportado correctamente.");
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

  if (isError || !data) {
    return (
      <EmployerPanelUnavailableNotice
        message="El cierre de nómina no está disponible en este momento."
        description="Esta sección se habilitará cuando haya información para mostrar."
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-border/80 bg-background p-5 shadow-sm sm:p-6">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total acumulado a descontar en nómina
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Adelantos + comisiones + cuotas — {data.monthLabel}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-primary/15 bg-primary/10">
              <Calculator className="h-5 w-5 text-primary" strokeWidth={2.25} />
            </div>
          </div>
          <AnimatedCurrency
            value={data.totalPayrollDeductions}
            className="font-display text-3xl font-bold text-gradient"
          />
        </div>

        <div className="rounded-xl border border-border/80 bg-background p-5 shadow-sm sm:p-6">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Monto de reembolso al proveedor
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Monto solicitado a reembolsar (la comisión la paga la empresa)
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[hsl(260_70%_50%)]/20 bg-[hsl(260_70%_50%)]/10">
              <ArrowRightLeft
                className="h-5 w-5 text-[hsl(260_70%_50%)]"
                strokeWidth={2.25}
              />
            </div>
          </div>
          <AnimatedCurrency
            value={data.providerReimbursement}
            className="font-display text-3xl font-bold text-gradient"
          />
        </div>
      </div>

      <div className="rounded-xl border border-border/80 bg-background p-4 shadow-sm sm:p-5">
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-display text-lg font-semibold text-foreground">
              Resumen por empleado
            </h3>
            <p className="text-sm text-muted-foreground">
              Listo para aplicar en la nómina de {data.monthLabel}
            </p>
          </div>
          <ExportReportButton
            onClick={handleExport}
            label="Exportar nómina (CSV)"
          />
        </div>

        <div className="overflow-x-auto rounded-xl border border-border/80">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/50 text-left">
                <th className="px-4 py-3 font-semibold text-muted-foreground">
                  Empleado
                </th>
                <th className="px-4 py-3 font-semibold text-muted-foreground">
                  Valor de adelantos
                </th>
                <th className="px-4 py-3 font-semibold text-muted-foreground">
                  Comisión (descontada al empleado)
                </th>
                <th className="px-4 py-3 font-semibold text-muted-foreground">
                  Cuotas del mes
                </th>
                <th className="px-4 py-3 font-semibold text-muted-foreground">
                  Total a descontar
                </th>
              </tr>
            </thead>
            <tbody>
              {data.employeeSummaries.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-sm text-muted-foreground">
                    No hay adelantos registrados en {data.monthLabel}. Los totales
                    se calcularán automáticamente cuando tus empleados soliciten
                    adelantos.
                  </td>
                </tr>
              ) : (
                data.employeeSummaries.map((summary) => (
                  <tr
                    key={summary.employeeDocument}
                    className="border-b border-border/70 last:border-0"
                  >
                    <td className="px-4 py-3.5">
                      <div className="font-medium text-foreground">
                        {summary.employeeName}
                      </div>
                      <div className="font-mono text-xs text-muted-foreground">
                        {summary.employeeDocument}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 tabular-nums text-foreground">
                      {formatCOP(summary.advancesTotal)}
                    </td>
                    <td className="px-4 py-3.5 tabular-nums text-muted-foreground">
                      {formatCOP(summary.feesTotal)}
                    </td>
                    <td className="px-4 py-3.5 tabular-nums text-foreground">
                      {formatCOP(summary.loanInstallmentsTotal)}
                    </td>
                    <td className="px-4 py-3.5 tabular-nums font-semibold text-foreground">
                      {formatCOP(summary.grandTotal)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            <tfoot>
              <tr className="border-t border-border bg-primary/[0.03]">
                <td
                  colSpan={4}
                  className="px-4 py-3.5 font-semibold text-foreground"
                >
                  <span className="inline-flex items-center gap-2">
                    <Receipt className="h-4 w-4 text-primary" />
                    Total consolidado del mes
                  </span>
                </td>
                <td className="px-4 py-3.5 font-display text-base font-bold text-gradient tabular-nums">
                  {formatCOP(data.totalPayrollDeductions)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
