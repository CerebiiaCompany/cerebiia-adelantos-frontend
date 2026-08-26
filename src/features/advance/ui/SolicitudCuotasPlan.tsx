import { useMemo } from "react";
import { formatCOP, formatDate, resolveInstallmentCutoffIso } from "@/shared/lib";
import type { CuotaAdelantoDTO } from "@/shared/api/types/adelanto";
import { cn } from "@/lib/utils";

type SolicitudCuotasPlanProps = {
  cuotas: CuotaAdelantoDTO[];
  /** Fecha de la solicitud: la cuota 1 debe caer en el mes de esta fecha. */
  requestedAt?: string | Date | null;
  /** Estado general de la solicitud (pagado, procesado, etc.). */
  solicitudEstado?: string | null;
  /** True si el adelanto completo está pagado o liquidado. */
  isPaid?: boolean;
  className?: string;
};

export function SolicitudCuotasPlan({
  cuotas,
  requestedAt,
  solicitudEstado,
  isPaid,
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
                      : tarifa === 0
                        ? "Gratis"
                        : formatCOP(tarifa)}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatDate(fechaCorte)}
                  </td>
                  <td className="px-4 py-3">
                    {(() => {
                      const st = (cuota.estado || "").toLowerCase().trim();
                      const isCuotaPaid =
                        st === "pagado" ||
                        st === "pagada" ||
                        st === "liberado" ||
                        st === "liberada" ||
                        st === "descontado" ||
                        st === "descontada" ||
                        Boolean(cuota.fecha_pago);

                      // El estado de retención en nómina proviene estrictamente de la liberación de la cuota por Super Admin
                      const isDescontado = isCuotaPaid;

                      return (
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold",
                            isDescontado
                              ? "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400"
                              : "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
                          )}
                        >
                          <span
                            className={cn(
                              "h-1.5 w-1.5 rounded-full",
                              isDescontado ? "bg-rose-500" : "bg-emerald-500",
                            )}
                          />
                          {isDescontado ? "Descontado" : "No descontado"}
                        </span>
                      );
                    })()}
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
