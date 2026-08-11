import { ExternalLink } from "lucide-react";
import type { ReporteDatoIncorrectoDTO } from "@/shared/api/types/empleado";
import { cn } from "@/lib/utils";

function formatDateTime(iso?: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export interface SoporteChatThreadProps {
  reporte: ReporteDatoIncorrectoDTO;
  /** Fallback if reporte.empresa_nombre is empty (legacy rows). */
  empresaNombreFallback?: string;
  className?: string;
}

export function SoporteChatThread({
  reporte,
  empresaNombreFallback = "",
  className,
}: SoporteChatThreadProps) {
  const empleadoNombre = reporte.empleado_nombre?.trim() || "Empleado";
  const empresaNombre =
    reporte.empresa_nombre?.trim() || empresaNombreFallback.trim() || "Empresa";
  const personaEmpresa =
    reporte.respondido_por_nombre?.trim() || "Representante";
  const hasResponse = Boolean(reporte.respuesta_empresa?.trim());

  return (
    <div
      className={cn(
        "space-y-4 rounded-xl border border-border/50 bg-muted/15 p-3 sm:p-4",
        className,
      )}
    >
      <div className="flex justify-end gap-2.5">
        <div className="max-w-[85%] space-y-1.5">
          <div className="flex items-center justify-end gap-2 px-1">
            <div className="text-right">
              <p className="text-xs font-semibold text-foreground">
                {empleadoNombre}
              </p>
              <p className="text-[11px] text-muted-foreground">Empleado</p>
            </div>
          </div>
          <div className="rounded-2xl rounded-tr-md bg-primary px-3.5 py-2.5 text-sm text-primary-foreground shadow-sm">
            <p className="whitespace-pre-wrap">{reporte.mensaje}</p>
            {reporte.evidencias.length > 0 ? (
              <ul className="mt-2 space-y-1 border-t border-primary-foreground/20 pt-2">
                {reporte.evidencias.map((evidencia) => (
                  <li key={`${reporte.id}-${evidencia.path || evidencia.nombre}`}>
                    {evidencia.url ? (
                      <a
                        href={evidencia.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-primary-foreground/95 underline-offset-2 hover:underline"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        {evidencia.nombre || "Ver evidencia"}
                      </a>
                    ) : (
                      <span className="text-xs text-primary-foreground/80">
                        {evidencia.nombre || "Evidencia"}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
          <p className="px-1 text-right text-[11px] text-muted-foreground">
            {formatDateTime(reporte.created_at)}
          </p>
        </div>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-primary text-[11px] font-bold text-primary-foreground">
          {initialsFromName(empleadoNombre)}
        </div>
      </div>

      {hasResponse ? (
        <div className="flex justify-start gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-[11px] font-bold text-primary">
            {initialsFromName(empresaNombre)}
          </div>
          <div className="max-w-[85%] space-y-1.5">
            <div className="px-1">
              <p className="text-xs font-semibold text-foreground">
                {empresaNombre}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {personaEmpresa}
              </p>
            </div>
            <div className="rounded-2xl rounded-tl-md border border-border/60 bg-background px-3.5 py-2.5 text-sm text-foreground shadow-sm">
              <p className="whitespace-pre-wrap">{reporte.respuesta_empresa}</p>
            </div>
            <p className="px-1 text-[11px] text-muted-foreground">
              {formatDateTime(reporte.respondido_en)}
            </p>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-warning/30 bg-warning/5 px-3 py-3 text-center text-sm text-muted-foreground">
          Esperando respuesta de {empresaNombre}.
        </div>
      )}
    </div>
  );
}
