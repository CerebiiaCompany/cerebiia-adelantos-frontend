import { useMemo, useState } from "react";
import { ChevronDown, ChevronRight, Receipt } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { AnimatedCurrency } from "@/components/ui/animated-number";
import { currentNominaPeriodoKey } from "@/features/employer-panel/model/useEmpresaReferenciaNomina";
import { useEmployerCompanyAdvances } from "@/features/employer-panel/model/useEmployerAuditData";
import {
  buildNominaDescuentosSnapshot,
  type EmployerNominaCuotaDetalle,
} from "@/entities/employer-audit";
import { EmployerPanelUnavailableNotice } from "@/features/employer-panel/ui/EmployerPanelUnavailableNotice";
import { formatCOP } from "@/shared/lib";
import { cn } from "@/lib/utils";

function formatPeriodoLabel(periodo: string): string {
  const [year, month] = periodo.split("-").map(Number);
  if (!year || !month) return periodo;
  const label = new Date(year, month - 1, 1).toLocaleDateString("es-CO", {
    month: "long",
    year: "numeric",
  });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function formatFechaCorte(iso: string): string {
  const date = new Date(`${iso}T12:00:00`);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function parseMoney(value: string | number | undefined): number {
  const n = Number(value ?? 0);
  return Number.isFinite(n) ? n : 0;
}

function CuotaRetencionBadge({ isDiscounted }: { isDiscounted: boolean }) {
  if (isDiscounted) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/30 bg-rose-500/10 px-2.5 py-0.5 text-xs font-semibold text-rose-500 dark:text-rose-400">
        <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
        Descontado
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-500 dark:text-emerald-400">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
      No descontado
    </span>
  );
}

function EmpleadoRetencionBadge({
  isAllDescontado,
  totalDescontado,
  totalDescontar,
}: {
  isAllDescontado: boolean;
  totalDescontado: number;
  totalDescontar: number;
}) {
  if (isAllDescontado) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/30 bg-rose-500/10 px-2.5 py-0.5 text-xs font-semibold text-rose-500 dark:text-rose-400">
        <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
        Descontado
      </span>
    );
  }
  if (totalDescontado > 0 && totalDescontar > 0) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
        Parcial
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-500 dark:text-emerald-400">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
      No descontado
    </span>
  );
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

type EmployerNominaDescuentosPanelProps = {
  selectedPeriod?: string;
  onPeriodChange?: (periodo: string) => void;
  periodOptions?: Array<{ value: string; label: string }>;
};

export function EmployerNominaDescuentosPanel({
  selectedPeriod,
}: EmployerNominaDescuentosPanelProps = {}) {
  const [internalPeriod] = useState(currentNominaPeriodoKey);
  const periodo = selectedPeriod ?? internalPeriod;

  const { data, isLoading, isError } = useEmployerCompanyAdvances();
  const [expandedDoc, setExpandedDoc] = useState<string | null>(null);

  const snapshot = useMemo(() => {
    const advances = data?.advances ?? [];
    return buildNominaDescuentosSnapshot(advances, periodo);
  }, [data?.advances, periodo]);

  const {
    resumen,
    totalDescontar,
    empleadosConDescuento,
    cuotasDelMes,
    cuotasPendientes,
    cuotasDescontadas,
  } = snapshot;

  return (
    <section className="glass-card glow-border space-y-5 rounded-xl p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <Receipt className="h-4 w-4 text-primary" strokeWidth={2.25} />
            <h2 className="font-display text-lg font-semibold text-foreground">
              Cuotas a descontar · {formatPeriodoLabel(periodo)}
            </h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Informe de descuentos de nómina según fecha de corte del mes seleccionado.
            Expande cada empleado para ver el detalle de cuotas.
          </p>
        </div>
      </div>

      {isLoading ? (
        <TableSkeleton />
      ) : isError ? (
        <EmployerPanelUnavailableNotice
          layout="inline"
          message="No se pudo cargar el informe de descuentos."
          description="Intenta de nuevo en unos minutos. Si el problema continúa, contacta a soporte."
        />
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-border/60 bg-muted/20 px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Total a descontar
              </p>
              <AnimatedCurrency
                value={totalDescontar}
                className="mt-1 font-display text-xl font-bold text-foreground"
              />
              <p className="mt-1 text-[11px] text-muted-foreground">
                {totalDescontar === 0
                  ? "Al día — No hay cuotas pendientes"
                  : `${cuotasPendientes} cuota${cuotasPendientes === 1 ? "" : "s"} pendiente${cuotasPendientes === 1 ? "" : "s"} por descontar`}
              </p>
            </div>
            <div className="rounded-xl border border-border/60 bg-muted/20 px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Empleados con descuento
              </p>
              <p className="mt-1 font-display text-xl font-bold text-foreground">
                {empleadosConDescuento}
              </p>
              <p className="mt-1 text-[11px] text-muted-foreground">
                de {resumen.length} empleado{resumen.length === 1 ? "" : "s"} con cuotas este mes
              </p>
            </div>
            <div className="rounded-xl border border-border/60 bg-muted/20 px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Cuotas del mes
              </p>
              <p className="mt-1 font-display text-xl font-bold text-foreground">
                {cuotasDelMes}
              </p>
              <p className="mt-1 text-[11px] text-muted-foreground">
                {cuotasPendientes} pendiente{cuotasPendientes === 1 ? "" : "s"} · {cuotasDescontadas} descontada{cuotasDescontadas === 1 ? "" : "s"}
              </p>
            </div>
          </div>

          {resumen.length === 0 ? (
            <div className="rounded-xl border border-border/60 bg-muted/20 px-4 py-10 text-center text-sm text-muted-foreground">
              No hay cuotas con fecha de corte en {formatPeriodoLabel(periodo)}.
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-border/60">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead className="border-b border-border/60 bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                    <tr>
                      <th className="w-10 px-3 py-3" />
                      <th className="px-3 py-3 font-medium">Empleado</th>
                      <th className="px-3 py-3 font-medium">Documento</th>
                      <th className="px-3 py-3 font-medium">Adelantos</th>
                      <th className="px-3 py-3 font-medium">Cuotas mes</th>
                      <th className="px-3 py-3 font-medium">Estado</th>
                      <th className="px-3 py-3 font-medium text-right">
                        A descontar
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {resumen.map((row) => {
                      const isExpanded = expandedDoc === row.documento;
                      return (
                        <EmployeeDeductionRows
                          key={row.documento}
                          fullName={row.fullName}
                          documento={row.documento}
                          cantidadAdelantos={row.cantidadAdelantos}
                          cuotasMes={row.cuotasMes}
                          totalDescontar={row.totalDescontar}
                          totalDescontado={row.totalDescontado}
                          totalGeneral={row.totalGeneral}
                          isAllDescontado={row.isAllDescontado}
                          isExpanded={isExpanded}
                          cuotas={row.cuotas}
                          onToggle={() =>
                            setExpandedDoc(isExpanded ? null : row.documento)
                          }
                        />
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
}

function EmployeeDeductionRows({
  fullName,
  documento,
  cantidadAdelantos,
  cuotasMes,
  totalDescontar,
  totalDescontado,
  totalGeneral,
  isAllDescontado,
  isExpanded,
  cuotas,
  onToggle,
}: {
  fullName: string;
  documento: string;
  cantidadAdelantos: number;
  cuotasMes: number;
  totalDescontar: number;
  totalDescontado: number;
  totalGeneral: number;
  isAllDescontado: boolean;
  isExpanded: boolean;
  cuotas: EmployerNominaCuotaDetalle[];
  onToggle: () => void;
}) {
  return (
    <>
      <tr
        className={cn(
          "border-b border-border/40 transition-colors hover:bg-muted/30",
          isExpanded && "bg-muted/20",
        )}
      >
        <td className="px-3 py-3">
          <button
            type="button"
            onClick={onToggle}
            className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label={isExpanded ? "Ocultar cuotas" : "Ver cuotas"}
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
        </td>
        <td className="px-3 py-3 font-medium text-foreground">{fullName}</td>
        <td className="px-3 py-3 font-mono text-xs text-muted-foreground">{documento}</td>
        <td className="px-3 py-3 text-foreground">{cantidadAdelantos}</td>
        <td className="px-3 py-3 text-foreground">{cuotasMes}</td>
        <td className="px-3 py-3">
          <EmpleadoRetencionBadge
            isAllDescontado={isAllDescontado}
            totalDescontado={totalDescontado}
            totalDescontar={totalDescontar}
          />
        </td>
        <td className="px-3 py-3 text-right">
          <span
            className={cn(
              "font-semibold tabular-nums",
              totalDescontar > 0 ? "text-foreground" : "text-muted-foreground",
            )}
          >
            {formatCOP(totalDescontar)}
          </span>
          {totalDescontado > 0 && totalDescontar > 0 && (
            <p className="mt-0.5 text-[11px] font-normal text-muted-foreground">
              ({formatCOP(totalDescontado)} descontado)
            </p>
          )}
        </td>
      </tr>
      {isExpanded ? (
        <tr className="border-b border-border/40 bg-muted/10">
          <td colSpan={7} className="px-4 py-3">
            <div className="overflow-hidden rounded-lg border border-border/50 bg-background/50">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2 font-medium">Cuota</th>
                    <th className="px-3 py-2 font-medium">Fecha corte</th>
                    <th className="px-3 py-2 font-medium">Estado</th>
                    <th className="px-3 py-2 font-medium">Adelanto</th>
                    <th className="px-3 py-2 font-medium text-right">
                      Descuento
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {cuotas.map((cuota) => {
                    const isDiscounted = cuota.estado_cuota === "pagada";
                    return (
                      <tr
                        key={`${cuota.solicitud_id}-${cuota.cuota_numero}`}
                        className="border-t border-border/40"
                      >
                        <td className="px-3 py-2 text-foreground font-medium">
                          {cuota.cuota_numero}/{cuota.total_cuotas}
                        </td>
                        <td className="px-3 py-2 text-muted-foreground">
                          {formatFechaCorte(cuota.fecha_corte)}
                        </td>
                        <td className="px-3 py-2">
                          <CuotaRetencionBadge isDiscounted={isDiscounted} />
                        </td>
                        <td className="px-3 py-2 text-muted-foreground tabular-nums">
                          {formatCOP(parseMoney(cuota.monto_solicitud))}
                        </td>
                        <td className="px-3 py-2 text-right font-medium tabular-nums">
                          {isDiscounted ? (
                            <span className="text-muted-foreground line-through opacity-70">
                              {formatCOP(parseMoney(cuota.monto_a_descontar))}
                            </span>
                          ) : (
                            <span className="text-foreground font-semibold">
                              {formatCOP(parseMoney(cuota.monto_a_descontar))}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </td>
        </tr>
      ) : null}
    </>
  );
}
