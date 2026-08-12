import { useMemo, useState } from "react";
import { ChevronDown, ChevronRight, Receipt } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { AnimatedCurrency } from "@/components/ui/animated-number";
import {
  currentNominaPeriodoKey,
  useEmpresaReferenciaNomina,
} from "@/features/employer-panel/model/useEmpresaReferenciaNomina";
import { EmployerPanelUnavailableNotice } from "@/features/employer-panel/ui/EmployerPanelUnavailableNotice";
import type { ReferenciaNominaDetalleDTO } from "@/shared/api/types";
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

function employeeFullName(nombre: string, apellido: string): string {
  return [nombre, apellido].filter(Boolean).join(" ").trim() || "—";
}

function estadoCuotaLabel(estado: string): string {
  if (estado === "pagada" || estado === "pagado") return "Pagada";
  if (estado === "pendiente") return "Pendiente";
  return estado;
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

export function EmployerNominaDescuentosPanel() {
  const periodo = currentNominaPeriodoKey();
  const query = useEmpresaReferenciaNomina(periodo);
  const [expandedDoc, setExpandedDoc] = useState<string | null>(null);

  const detalleByDoc = useMemo(() => {
    const map = new Map<string, ReferenciaNominaDetalleDTO[]>();
    for (const row of query.data?.detalle ?? []) {
      const list = map.get(row.numero_documento) ?? [];
      list.push(row);
      map.set(row.numero_documento, list);
    }
    return map;
  }, [query.data?.detalle]);

  const resumen = query.data?.resumen ?? [];
  const totalDescontar = parseMoney(query.data?.total_a_descontar);
  const empleadosConDescuento = resumen.length;
  const cuotasDelMes = query.data?.detalle?.length ?? 0;

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
            Informe de descuentos de nómina según fecha de corte del mes actual.
            Expande cada empleado para ver el detalle de cuotas.
          </p>
        </div>
      </div>

      {query.isLoading ? (
        <TableSkeleton />
      ) : query.isError ? (
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
            </div>
            <div className="rounded-xl border border-border/60 bg-muted/20 px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Empleados con descuento
              </p>
              <p className="mt-1 font-display text-xl font-bold text-foreground">
                {empleadosConDescuento}
              </p>
            </div>
            <div className="rounded-xl border border-border/60 bg-muted/20 px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Cuotas del mes
              </p>
              <p className="mt-1 font-display text-xl font-bold text-foreground">
                {cuotasDelMes}
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
                <table className="w-full min-w-[720px] text-left text-sm">
                  <thead className="border-b border-border/60 bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                    <tr>
                      <th className="w-10 px-3 py-3" />
                      <th className="px-3 py-3 font-medium">Empleado</th>
                      <th className="px-3 py-3 font-medium">Documento</th>
                      <th className="px-3 py-3 font-medium">Adelantos</th>
                      <th className="px-3 py-3 font-medium">Cuotas mes</th>
                      <th className="px-3 py-3 font-medium text-right">
                        A descontar
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {resumen.map((row) => {
                      const isExpanded = expandedDoc === row.numero_documento;
                      const cuotas =
                        detalleByDoc.get(row.numero_documento) ?? [];
                      return (
                        <EmployeeDeductionRows
                          key={row.numero_documento}
                          fullName={employeeFullName(row.nombre, row.apellido)}
                          documento={row.numero_documento}
                          cantidadAdelantos={row.cantidad_adelantos}
                          cuotasMes={cuotas.length}
                          totalDescontar={parseMoney(row.total_a_descontar_mes)}
                          isExpanded={isExpanded}
                          cuotas={cuotas}
                          onToggle={() =>
                            setExpandedDoc(
                              isExpanded ? null : row.numero_documento,
                            )
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
  isExpanded,
  cuotas,
  onToggle,
}: {
  fullName: string;
  documento: string;
  cantidadAdelantos: number;
  cuotasMes: number;
  totalDescontar: number;
  isExpanded: boolean;
  cuotas: ReferenciaNominaDetalleDTO[];
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
        <td className="px-3 py-3 text-muted-foreground">{documento}</td>
        <td className="px-3 py-3 text-foreground">{cantidadAdelantos}</td>
        <td className="px-3 py-3 text-foreground">{cuotasMes}</td>
        <td className="px-3 py-3 text-right font-semibold text-foreground">
          {formatCOP(totalDescontar)}
        </td>
      </tr>
      {isExpanded ? (
        <tr className="border-b border-border/40 bg-muted/10">
          <td colSpan={6} className="px-4 py-3">
            <div className="overflow-hidden rounded-lg border border-border/50">
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
                  {cuotas.map((cuota) => (
                    <tr
                      key={`${cuota.solicitud_id}-${cuota.cuota_numero}`}
                      className="border-t border-border/40"
                    >
                      <td className="px-3 py-2 text-foreground">
                        {cuota.cuota_numero}/{cuota.total_cuotas}
                      </td>
                      <td className="px-3 py-2 text-muted-foreground">
                        {formatFechaCorte(cuota.fecha_corte)}
                      </td>
                      <td className="px-3 py-2 text-foreground">
                        {estadoCuotaLabel(cuota.estado_cuota)}
                      </td>
                      <td className="px-3 py-2 text-muted-foreground">
                        {formatCOP(parseMoney(cuota.monto_solicitud))}
                      </td>
                      <td className="px-3 py-2 text-right font-medium text-foreground">
                        {formatCOP(parseMoney(cuota.monto_a_descontar))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </td>
        </tr>
      ) : null}
    </>
  );
}
