import { useMemo } from "react";
import { formatCOP, formatDate, resolveInstallmentCutoffIso } from "@/shared/lib";
import type { CuotaAdelantoDTO } from "@/shared/api/types/adelanto";
import { cn } from "@/lib/utils";

type SolicitudCuotasPlanProps = {
  cuotas: CuotaAdelantoDTO[];
  /** Fecha de la solicitud: la cuota 1 debe caer en el mes de esta fecha. */
  requestedAt?: string | Date | null;
  className?: string;
};

export function SolicitudCuotasPlan({
  cuotas,
  requestedAt,
  className,
}: SolicitudCuotasPlanProps) {
  const sorted = useMemo(
    () => [...cuotas].sort((a, b) => a.numero - b.numero),
    [cuotas],
  );

  if (sorted.length === 0) return null;

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-border bg-white",
        className,
      )}
    >
      <div className="border-b border-border bg-secondary/40 px-4 py-3">
        <p className="text-sm font-semibold text-foreground">
          Plan de descuentos
        </p>
        <p className="text-xs text-muted-foreground">
          La primera fecha de corte corresponde al pago del mes en que se
          solicitó el adelanto
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[480px] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-[11px] uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-2.5 font-semibold">Cuota</th>
              <th className="px-4 py-2.5 font-semibold">Monto</th>
              <th className="px-4 py-2.5 font-semibold">Tarifa</th>
              <th className="px-4 py-2.5 font-semibold">Corte</th>
              <th className="px-4 py-2.5 font-semibold">Estado</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((cuota) => {
              const monto = Number.parseFloat(cuota.monto);
              const tarifa = Number.parseFloat(cuota.tarifa_cuota);
              const fechaCorte = requestedAt
                ? resolveInstallmentCutoffIso(
                    requestedAt,
                    cuota.numero,
                    sorted.length,
                    cuota.fecha_corte,
                  )
                : cuota.fecha_corte;

              return (
                <tr
                  key={cuota.id}
                  className="border-b border-border/70 last:border-0"
                >
                  <td className="px-4 py-3 font-medium text-foreground">
                    #{cuota.numero}
                  </td>
                  <td className="px-4 py-3 tabular-nums text-foreground">
                    {Number.isNaN(monto) ? cuota.monto : formatCOP(monto)}
                  </td>
                  <td className="px-4 py-3 tabular-nums text-muted-foreground">
                    {Number.isNaN(tarifa)
                      ? cuota.tarifa_cuota
                      : formatCOP(tarifa)}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatDate(fechaCorte)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "inline-flex rounded-md border px-2 py-0.5 text-xs font-medium",
                        cuota.estado === "pagado"
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                          : "border-amber-200 bg-amber-50 text-amber-700",
                      )}
                    >
                      {cuota.estado === "pagado" ? "Pagada" : "Pendiente"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
