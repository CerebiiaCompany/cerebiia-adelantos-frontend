import { useMemo, useState } from "react";
import { ClipboardCheck, Search, ShieldAlert } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
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

function filterRecords(
  records: EmployerAdvanceAuditRecord[],
  query: string,
): EmployerAdvanceAuditRecord[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return records;

  return records.filter(
    (record) =>
      record.employeeName.toLowerCase().includes(normalized) ||
      record.employeeDocument.includes(normalized),
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
  const [selectedSolicitud, setSelectedSolicitud] = useState<{
    id: string;
    employeeName: string;
  } | null>(null);
  const { data, isLoading, isError } = useEmployerAdvanceAudit();
  const { data: adelantoConfig } = useEmployerConfig();

  const filteredRecords = useMemo(
    () => filterRecords(data ?? [], search),
    [data, search],
  );

  const complianceAlerts = useMemo(
    () =>
      filteredRecords.filter((record) =>
        exceedsSalaryCap(record.advancedAmount, record.baseSalary),
      ).length,
    [filteredRecords],
  );

  const tarifaPorCuotaLabel = adelantoConfig
    ? formatCOP(adelantoConfig.tarifaFijaPorCuota)
    : null;

  return (
    <div className="glass-card glow-border rounded-xl p-4 sm:p-5">
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por empleado o documento..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="h-11 rounded-xl border-border/80 bg-background/80 pl-10"
            disabled={isLoading}
          />
        </div>
        {complianceAlerts > 0 ? (
          <div className="inline-flex items-center gap-2 rounded-xl border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
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
                  Total a descontar en nómina
                </th>
                <th className="px-4 py-3 font-semibold text-muted-foreground">
                  Cuotas de pago
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
                  <td colSpan={10} className="px-4 py-10 text-center">
                    <div className="mx-auto flex max-w-sm flex-col items-center gap-2 text-muted-foreground">
                      <ClipboardCheck className="h-8 w-8 opacity-60" />
                      <p className="text-sm">
                        {search.trim()
                          ? "No hay adelantos que coincidan con tu búsqueda."
                          : "Aún no hay adelantos registrados. Aparecerán aquí cuando tus empleados soliciten un adelanto."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRecords.map((record) => {
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
                  );

                  return (
                    <tr
                      key={record.id}
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
                      <td className="px-4 py-3.5 tabular-nums font-medium text-foreground">
                        {formatCOP(totalWithholding)}
                      </td>
                      <td className="px-4 py-3.5 text-foreground">
                        {record.installments}{" "}
                        {record.installments === 1 ? "cuota" : "cuotas"}
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
  );
}
