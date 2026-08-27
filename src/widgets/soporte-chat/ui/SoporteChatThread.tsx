import { useState } from "react";
import { CheckCircle2, Download, ExternalLink, FileText, X, ZoomIn } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type {
  EvidenciaAdjuntoDTO,
  ReporteDatoIncorrectoDTO,
  SoporteMensajeDTO,
} from "@/shared/api/types/empleado";
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

function isImageFile(nombre?: string, url?: string): boolean {
  const target = `${nombre || ""} ${url || ""}`.toLowerCase();
  return /\.(png|jpe?g|webp|gif|svg|bmp)(\?.*)?$/i.test(target);
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
  const [selectedImage, setSelectedImage] = useState<{
    url: string;
    nombre: string;
  } | null>(null);

  const empleadoNombre = reporte.empleado_nombre?.trim() || "Empleado";
  const empresaNombre =
    reporte.empresa_nombre?.trim() || empresaNombreFallback.trim() || "Empresa";
  const personaEmpresa =
    reporte.respondido_por_nombre?.trim() || "Representante";

  const isFinalizado =
    reporte.estado === "resuelto" ||
    reporte.estado === "finalizado" ||
    Boolean(reporte.finalizado);

  // Consolidar mensajes sin duplicar el mensaje inicial
  const messagesToRender: SoporteMensajeDTO[] = (() => {
    if (reporte.mensajes && reporte.mensajes.length > 0) {
      const containsInitial = reporte.mensajes.some(
        (m) =>
          m.id === reporte.id ||
          (m.remitente === "empleado" && m.mensaje.trim() === reporte.mensaje.trim()),
      );

      if (containsInitial) {
        return reporte.mensajes;
      }

      const initialMsg: SoporteMensajeDTO = {
        id: reporte.id || "initial-msg",
        remitente: "empleado",
        remitente_nombre: empleadoNombre,
        mensaje: reporte.mensaje,
        created_at: reporte.created_at,
        evidencias: reporte.evidencias,
      };

      return [initialMsg, ...reporte.mensajes];
    }

    // Modo legacy: mensaje inicial + respuesta empresa
    const list: SoporteMensajeDTO[] = [
      {
        id: reporte.id || "initial-msg",
        remitente: "empleado",
        remitente_nombre: empleadoNombre,
        mensaje: reporte.mensaje,
        created_at: reporte.created_at,
        evidencias: reporte.evidencias,
      },
    ];

    if (reporte.respuesta_empresa?.trim()) {
      list.push({
        id: "legacy-reply",
        remitente: "empresa",
        remitente_nombre: `${empresaNombre} (${personaEmpresa})`,
        mensaje: reporte.respuesta_empresa,
        created_at: reporte.respondido_en || reporte.created_at,
      });
    }

    return list;
  })();

  const renderEvidencias = (
    evidencias: EvidenciaAdjuntoDTO[] | undefined,
    isFromEmpleado: boolean,
  ) => {
    if (!evidencias || evidencias.length === 0) return null;

    return (
      <div className="mt-2.5 space-y-2 border-t border-current/15 pt-2.5">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {evidencias.map((ev, idx) => {
            const isImg = isImageFile(ev.nombre, ev.url);

            if (isImg && ev.url) {
              return (
                <div
                  key={`${ev.path || ev.nombre}-${idx}`}
                  className="group relative overflow-hidden rounded-xl border border-current/20 bg-black/10 transition-all hover:shadow-md"
                >
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedImage({ url: ev.url, nombre: ev.nombre || "Evidencia" })
                    }
                    className="relative block h-36 w-full cursor-zoom-in overflow-hidden"
                    title="Clic para ver en tamaño completo"
                  >
                    <img
                      src={ev.url}
                      alt={ev.nombre || "Evidencia"}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity group-hover:opacity-100">
                      <span className="inline-flex items-center gap-1.5 rounded-lg bg-black/70 px-2.5 py-1 text-xs font-medium text-white shadow">
                        <ZoomIn className="h-3.5 w-3.5" />
                        Ver imagen
                      </span>
                    </div>
                  </button>
                  <div className="p-1.5 px-2 text-[11px] truncate opacity-90">
                    {ev.nombre || "Evidencia gráfica"}
                  </div>
                </div>
              );
            }

            return (
              <div
                key={`${ev.path || ev.nombre}-${idx}`}
                className={cn(
                  "flex items-center justify-between gap-2 rounded-lg border p-2 text-xs",
                  isFromEmpleado
                    ? "border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground"
                    : "border-border/60 bg-muted/30 text-foreground",
                )}
              >
                <div className="flex min-w-0 items-center gap-1.5">
                  <FileText className="h-4 w-4 shrink-0" />
                  <span className="truncate">{ev.nombre || "Documento adjunto"}</span>
                </div>
                {ev.url ? (
                  <a
                    href={ev.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex shrink-0 items-center gap-1 rounded px-1.5 py-0.5 font-medium underline-offset-2 hover:underline"
                  >
                    <ExternalLink className="h-3 w-3" />
                    Abrir
                  </a>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <>
      <div
        className={cn(
          "space-y-4 rounded-xl border border-border/50 bg-muted/15 p-3 sm:p-4",
          className,
        )}
      >
        {messagesToRender.map((msg) => {
          const isFromEmpleado = msg.remitente === "empleado";
          const senderName = isFromEmpleado
            ? msg.remitente_nombre || empleadoNombre
            : msg.remitente_nombre || empresaNombre;

          return (
            <div
              key={msg.id}
              className={cn(
                "flex gap-2.5",
                isFromEmpleado ? "justify-end" : "justify-start",
              )}
            >
              {!isFromEmpleado ? (
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-[11px] font-bold text-primary">
                  {initialsFromName(senderName)}
                </div>
              ) : null}

              <div className="max-w-[85%] sm:max-w-[78%] min-w-0 space-y-1.5 break-words">
                <div
                  className={cn(
                    "flex items-center gap-2 px-1",
                    isFromEmpleado ? "justify-end" : "justify-start",
                  )}
                >
                  <p className="text-xs font-semibold text-foreground truncate">
                    {senderName}
                  </p>
                  <p className="text-[11px] text-muted-foreground shrink-0">
                    {isFromEmpleado ? "Empleado" : "Empresa"}
                  </p>
                </div>

                <div
                  className={cn(
                    "rounded-2xl px-3.5 py-2.5 text-sm shadow-sm break-words overflow-hidden",
                    isFromEmpleado
                      ? "rounded-tr-md bg-primary text-primary-foreground"
                      : "rounded-tl-md border border-border/60 bg-background text-foreground",
                  )}
                >
                  <p className="whitespace-pre-wrap break-words">{msg.mensaje}</p>
                  {renderEvidencias(msg.evidencias, isFromEmpleado)}
                </div>

                <p
                  className={cn(
                    "px-1 text-[11px] text-muted-foreground",
                    isFromEmpleado ? "text-right" : "text-left",
                  )}
                >
                  {formatDateTime(msg.created_at)}
                </p>
              </div>

              {isFromEmpleado ? (
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-primary text-[11px] font-bold text-primary-foreground">
                  {initialsFromName(empleadoNombre)}
                </div>
              ) : null}
            </div>
          );
        })}

        {messagesToRender.length === 1 && !isFinalizado ? (
          <div className="rounded-xl border border-dashed border-warning/30 bg-warning/5 px-3 py-3 text-center text-sm text-muted-foreground">
            Esperando respuesta de {empresaNombre}.
          </div>
        ) : null}

        {/* Indicador de chat finalizado */}
        {isFinalizado ? (
          <div className="flex items-center justify-center gap-2 rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-3 py-2.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>Este chat de soporte ha sido marcado como finalizado por la empresa.</span>
          </div>
        ) : null}
      </div>

      {/* Modal Lightbox para ver la imagen en tamaño completo */}
      <Dialog
        open={Boolean(selectedImage)}
        onOpenChange={(open) => {
          if (!open) setSelectedImage(null);
        }}
      >
        <DialogContent className="max-h-[92vh] max-w-3xl overflow-hidden border-border/60 bg-shell p-0 shadow-2xl sm:rounded-2xl">
          <DialogHeader className="flex flex-row items-center justify-between border-b border-border/40 px-5 py-3 text-left">
            <DialogTitle className="text-sm font-semibold truncate max-w-md">
              {selectedImage?.nombre || "Evidencia adjunta"}
            </DialogTitle>
            {selectedImage?.url ? (
              <a
                href={selectedImage.url}
                target="_blank"
                rel="noopener noreferrer"
                download
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-secondary/60 px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-secondary"
              >
                <Download className="h-3.5 w-3.5" />
                Descargar
              </a>
            ) : null}
          </DialogHeader>

          <div className="flex max-h-[75vh] items-center justify-center overflow-auto bg-black/5 p-4 dark:bg-black/40">
            {selectedImage?.url ? (
              <img
                src={selectedImage.url}
                alt={selectedImage.nombre}
                className="max-h-[70vh] w-auto max-w-full rounded-lg object-contain shadow-md"
              />
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}


