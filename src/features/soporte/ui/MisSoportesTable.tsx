import { useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronRight, Paperclip, Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useProfileView } from "@/features/auth";
import { useReportesDatoIncorrectoMe } from "@/features/soporte/model/useReportesDatoIncorrectoMe";
import { useEnviarMensajeSoporteMe } from "@/features/soporte/model/useEnviarMensajeSoporteMe";
import { SoporteAlertDot } from "@/features/soporte/ui/SoporteAlertDot";
import { SoporteChatThread } from "@/widgets/soporte-chat";
import type { ReporteDatoIncorrectoDTO } from "@/shared/api/types/empleado";
import {
  getSeenSoporteResponseIds,
  hasCompanySoporteReply,
  isSoporteResponseUnread,
  markSoporteResponseSeen,
  SOPORTE_SEEN_CHANGED_EVENT,
} from "@/shared/lib/soporteSeenStorage";
import { cn } from "@/lib/utils";

const CAMPO_LABELS: Record<string, string> = {
  nombre: "Nombres completos",
  documento: "Número de documento",
  banco: "Banco",
  tipo_cuenta: "Tipo de cuenta",
  numero_cuenta: "Cuenta bancaria",
};

const ESTADO_LABELS: Record<string, string> = {
  pendiente: "Pendiente",
  en_revision: "En revisión",
  respondido: "Respondido",
  resuelto: "Finalizado",
  finalizado: "Finalizado",
};

function formatDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function estadoTone(estado: string): string {
  if (estado === "respondido") {
    return "bg-primary/10 text-primary";
  }
  if (estado === "resuelto" || estado === "finalizado") {
    return "bg-success/10 text-success";
  }
  return "bg-warning/10 text-warning";
}

function TableSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, index) => (
        <Skeleton key={index} className="h-14 w-full rounded-lg" />
      ))}
    </div>
  );
}

export function MisSoportesTable() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [seenIds, setSeenIds] = useState(() => getSeenSoporteResponseIds());
  const profile = useProfileView();
  const empresaFallback = profile?.company ?? "";
  const pageSize = 20;
  const query = useReportesDatoIncorrectoMe({ page, page_size: pageSize });

  useEffect(() => {
    const sync = () => setSeenIds(getSeenSoporteResponseIds());
    window.addEventListener(SOPORTE_SEEN_CHANGED_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(SOPORTE_SEEN_CHANGED_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const records = query.data?.results ?? [];
  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return records;
    return records.filter((row) => {
      const haystack = [
        row.mensaje,
        row.estado,
        row.respuesta_empresa ?? "",
        ...row.campos_reportados.map((c) => CAMPO_LABELS[c] ?? c),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(term);
    });
  }, [records, search]);

  const totalCount = query.data?.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const handleToggle = (row: ReporteDatoIncorrectoDTO, isExpanded: boolean) => {
    if (isExpanded) {
      setExpandedId(null);
      return;
    }
    setExpandedId(row.id);
    if (hasCompanySoporteReply(row) && isSoporteResponseUnread(row.id, true, seenIds)) {
      setSeenIds(markSoporteResponseSeen(row.id));
    }
  };

  if (query.isLoading) return <TableSkeleton />;

  if (query.isError) {
    return (
      <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-8 text-center">
        <p className="text-sm font-medium text-foreground">
          No se pudieron cargar tus solicitudes de soporte.
        </p>
        <button
          type="button"
          onClick={() => query.refetch()}
          className="mt-2 text-sm font-medium text-primary hover:underline"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar por mensaje o dato..."
          className="pl-9"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-border/60 bg-muted/20 px-4 py-10 text-center text-sm text-muted-foreground">
          {records.length === 0
            ? "Aún no has enviado solicitudes de soporte."
            : "No hay resultados para tu búsqueda."}
        </div>
      ) : (
        <>
          {/* Vista Móvil: Tarjetas adaptadas y chat 100% centrado y legible */}
          <div className="space-y-3 md:hidden">
            {filtered.map((row) => {
              const isExpanded = expandedId === row.id;
              const unread = isSoporteResponseUnread(
                row.id,
                hasCompanySoporteReply(row),
                seenIds,
              );
              return (
                <MobileSupportCard
                  key={row.id}
                  row={row}
                  isExpanded={isExpanded}
                  unread={unread}
                  empresaNombreFallback={empresaFallback}
                  onToggle={() => handleToggle(row, isExpanded)}
                />
              );
            })}
          </div>

          {/* Vista Escritorio: Tabla tradicional con vista expandible */}
          <div className="hidden overflow-hidden rounded-xl border border-border/60 md:block">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="border-b border-border/60 bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="w-10 px-3 py-3" />
                    <th className="px-3 py-3 font-medium">Fecha</th>
                    <th className="px-3 py-3 font-medium">Datos reportados</th>
                    <th className="px-3 py-3 font-medium">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((row) => {
                    const isExpanded = expandedId === row.id;
                    const unread = isSoporteResponseUnread(
                      row.id,
                      hasCompanySoporteReply(row),
                      seenIds,
                    );
                    return (
                      <DesktopSupportRow
                        key={row.id}
                        row={row}
                        isExpanded={isExpanded}
                        unread={unread}
                        empresaNombreFallback={empresaFallback}
                        onToggle={() => handleToggle(row, isExpanded)}
                      />
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {totalCount > pageSize ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground text-center sm:text-left">
            Página {page} de {totalPages} · {totalCount} solicitudes
          </p>
          <div className="flex justify-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Anterior
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Siguiente
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

/** Formulario de respuesta común para Empleado */
function EmployeeReplyForm({
  rowId,
  isPending,
  onSend,
}: {
  rowId: string;
  isPending: boolean;
  onSend: (text: string, files: File[]) => void;
}) {
  const [mensaje, setMensaje] = useState("");
  const [archivos, setArchivos] = useState<File[]>([]);

  const handleEnviar = () => {
    const text = mensaje.trim();
    if (text.length < 3) {
      toast.error("Por favor escribe tu mensaje antes de enviar.");
      return;
    }
    onSend(text, archivos);
    setMensaje("");
    setArchivos([]);
  };

  return (
    <div className="space-y-3 rounded-xl border border-primary/20 bg-background/95 p-3.5 sm:p-4 shadow-sm w-full">
      <div className="flex flex-wrap items-center justify-between gap-1">
        <p className="text-xs font-semibold text-foreground">
          Enviar mensaje a la empresa
        </p>
        <span className="text-[11px] text-muted-foreground">
          Chat activo
        </span>
      </div>

      <Textarea
        value={mensaje}
        onChange={(event) => setMensaje(event.target.value)}
        placeholder="Escribe más detalles o responde a lo solicitado por la empresa..."
        className="min-h-[85px] w-full resize-none text-sm rounded-lg"
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-1">
        <label className="inline-flex cursor-pointer items-center justify-center sm:justify-start gap-1.5 rounded-lg border border-border/80 bg-muted/40 px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
          <Paperclip className="h-4 w-4" />
          <span className="truncate">
            {archivos.length > 0
              ? `${archivos.length} archivo(s) seleccionado(s)`
              : "Adjuntar evidencia (opcional)"}
          </span>
          <input
            type="file"
            multiple
            className="sr-only"
            onChange={(e) => {
              if (e.target.files) {
                setArchivos(Array.from(e.target.files));
              }
            }}
          />
        </label>

        <button
          type="button"
          disabled={isPending || mensaje.trim().length < 3}
          onClick={handleEnviar}
          className="group inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#7c3aed] via-[#6366f1] to-[#2563eb] px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/25 transition-all duration-200 hover:from-[#6d28d9] hover:via-[#4f46e5] hover:to-[#1d4ed8] hover:shadow-lg hover:shadow-indigo-500/35 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
        >
          {isPending ? (
            <span className="inline-flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Enviando...
            </span>
          ) : (
            <>
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-4 w-4 shrink-0 -rotate-12 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
              <span>Enviar mensaje</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

/** Tarjeta responsiva para Móvil en Panel Empleado */
function MobileSupportCard({
  row,
  isExpanded,
  unread,
  empresaNombreFallback,
  onToggle,
}: {
  row: ReporteDatoIncorrectoDTO;
  isExpanded: boolean;
  unread: boolean;
  empresaNombreFallback: string;
  onToggle: () => void;
}) {
  const { mutate: enviarMensaje, isPending } = useEnviarMensajeSoporteMe();

  const isFinalizado =
    row.estado === "resuelto" ||
    row.estado === "finalizado" ||
    Boolean(row.finalizado);

  const handleSend = (mensajeText: string, files: File[]) => {
    enviarMensaje(
      {
        reporteId: row.id,
        mensaje: mensajeText,
        evidencias: files.length > 0 ? files : undefined,
      },
      {
        onSuccess: () => {
          toast.success("Mensaje enviado a la empresa.");
        },
        onError: (err) => {
          toast.error(
            err instanceof Error
              ? err.message
              : "No se pudo enviar el mensaje a la empresa.",
          );
        },
      },
    );
  };

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-border/70 bg-card p-3.5 shadow-sm transition-colors",
        isExpanded && "border-primary/40 bg-muted/10",
        unread && "border-primary/50 bg-primary/[0.03]",
      )}
    >
      <div
        role="button"
        tabIndex={0}
        onClick={onToggle}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onToggle();
          }
        }}
        className="flex cursor-pointer items-start justify-between gap-2"
      >
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium",
                estadoTone(row.estado),
              )}
            >
              {ESTADO_LABELS[row.estado] ?? row.estado}
              {unread ? <SoporteAlertDot count={1} /> : null}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatDateTime(row.created_at)}
            </span>
          </div>

          <p className="text-xs font-medium text-foreground line-clamp-2">
            <span className="text-muted-foreground font-normal">Datos: </span>
            {row.campos_reportados
              .map((campo) => CAMPO_LABELS[campo] ?? campo)
              .join(", ") || "—"}
          </p>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-background/80 text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label={isExpanded ? "Ocultar chat" : "Ver chat"}
        >
          {isExpanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </button>
      </div>

      {isExpanded && (
        <div className="mt-3.5 space-y-3.5 border-t border-border/50 pt-3.5">
          <SoporteChatThread
            reporte={row}
            empresaNombreFallback={empresaNombreFallback}
          />

          {!isFinalizado ? (
            <EmployeeReplyForm
              rowId={row.id}
              isPending={isPending}
              onSend={handleSend}
            />
          ) : null}
        </div>
      )}
    </div>
  );
}

/** Fila para Escritorio en Panel Empleado */
function DesktopSupportRow({
  row,
  isExpanded,
  unread,
  empresaNombreFallback,
  onToggle,
}: {
  row: ReporteDatoIncorrectoDTO;
  isExpanded: boolean;
  unread: boolean;
  empresaNombreFallback: string;
  onToggle: () => void;
}) {
  const { mutate: enviarMensaje, isPending } = useEnviarMensajeSoporteMe();

  const isFinalizado =
    row.estado === "resuelto" ||
    row.estado === "finalizado" ||
    Boolean(row.finalizado);

  const handleSend = (mensajeText: string, files: File[]) => {
    enviarMensaje(
      {
        reporteId: row.id,
        mensaje: mensajeText,
        evidencias: files.length > 0 ? files : undefined,
      },
      {
        onSuccess: () => {
          toast.success("Mensaje enviado a la empresa.");
        },
        onError: (err) => {
          toast.error(
            err instanceof Error
              ? err.message
              : "No se pudo enviar el mensaje a la empresa.",
          );
        },
      },
    );
  };

  return (
    <>
      <tr
        className={cn(
          "border-b border-border/40 transition-colors hover:bg-muted/30",
          isExpanded && "bg-muted/20",
          unread && "bg-primary/[0.04]",
        )}
      >
        <td className="px-3 py-3">
          <button
            type="button"
            onClick={onToggle}
            className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label={isExpanded ? "Ocultar detalle" : "Ver detalle"}
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
        </td>
        <td className="whitespace-nowrap px-3 py-3">
          {formatDateTime(row.created_at)}
        </td>
        <td className="px-3 py-3 text-muted-foreground">
          {row.campos_reportados
            .map((campo) => CAMPO_LABELS[campo] ?? campo)
            .join(", ") || "—"}
        </td>
        <td className="px-3 py-3">
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium",
              estadoTone(row.estado),
            )}
          >
            {ESTADO_LABELS[row.estado] ?? row.estado}
            {unread ? <SoporteAlertDot count={1} /> : null}
          </span>
        </td>
      </tr>
      {isExpanded ? (
        <tr className="border-b border-border/40 bg-muted/10">
          <td colSpan={4} className="space-y-4 px-4 py-3">
            <SoporteChatThread
              reporte={row}
              empresaNombreFallback={empresaNombreFallback}
            />

            {!isFinalizado ? (
              <EmployeeReplyForm
                rowId={row.id}
                isPending={isPending}
                onSend={handleSend}
              />
            ) : null}
          </td>
        </tr>
      ) : null}
    </>
  );
}
