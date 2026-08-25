import { useMemo, useState } from "react";
import { ChevronDown, ChevronRight, Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { PrimaryActionButton } from "@/components/ui/primary-action-button";
import { useProfileView } from "@/features/auth";
import { useReportesDatoIncorrectoEmpresa } from "@/features/employer-panel/model/useReportesDatoIncorrectoEmpresa";
import { useResponderReporteDatoIncorrecto } from "@/features/employer-panel/model/useResponderReporteDatoIncorrecto";
import { useFinalizarReporteDatoIncorrecto } from "@/features/employer-panel/model/useFinalizarReporteDatoIncorrecto";
import { SoporteChatThread } from "@/widgets/soporte-chat";
import { ApiError } from "@/shared/api";
import type { ReporteDatoIncorrectoDTO } from "@/shared/api/types/empleado";
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

export function ReportesDatosIncorrectosTable() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const profile = useProfileView();
  const empresaFallback = profile?.company ?? "";
  const pageSize = 20;
  const query = useReportesDatoIncorrectoEmpresa({
    page,
    page_size: pageSize,
  });

  const records = query.data?.results ?? [];
  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return records;
    return records.filter((row) => {
      const haystack = [
        row.empleado_nombre,
        row.empleado_documento,
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

  if (query.isLoading) return <TableSkeleton />;

  if (query.isError) {
    return (
      <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-8 text-center">
        <p className="text-sm font-medium text-foreground">
          No se pudieron cargar los reportes de soporte.
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
          placeholder="Buscar por empleado o mensaje..."
          className="pl-9"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-border/60 bg-muted/20 px-4 py-10 text-center text-sm text-muted-foreground">
          {records.length === 0
            ? "No hay reportes de soporte por ahora."
            : "No hay resultados para tu búsqueda."}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border/60">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-border/60 bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="w-10 px-3 py-3" />
                  <th className="px-3 py-3 font-medium">Fecha</th>
                  <th className="px-3 py-3 font-medium">Empleado</th>
                  <th className="px-3 py-3 font-medium">Datos reportados</th>
                  <th className="px-3 py-3 font-medium">Estado</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => {
                  const isExpanded = expandedId === row.id;
                  return (
                    <ReportRow
                      key={row.id}
                      row={row}
                      isExpanded={isExpanded}
                      empresaNombreFallback={empresaFallback}
                      onToggle={() =>
                        setExpandedId(isExpanded ? null : row.id)
                      }
                    />
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {totalCount > pageSize ? (
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            Página {page} de {totalPages} · {totalCount} reportes
          </p>
          <div className="flex gap-2">
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

function ReportRow({
  row,
  isExpanded,
  empresaNombreFallback,
  onToggle,
}: {
  row: ReporteDatoIncorrectoDTO;
  isExpanded: boolean;
  empresaNombreFallback: string;
  onToggle: () => void;
}) {
  const [respuesta, setRespuesta] = useState("");
  const { mutate: responder, isPending: isResponding } =
    useResponderReporteDatoIncorrecto();
  const { mutate: finalizar, isPending: isFinalizing } =
    useFinalizarReporteDatoIncorrecto();

  const isFinalizado =
    row.estado === "resuelto" ||
    row.estado === "finalizado" ||
    Boolean(row.finalizado);

  const handleResponder = () => {
    const text = respuesta.trim();
    if (text.length < 3) {
      toast.error("La respuesta debe tener al menos 3 caracteres.");
      return;
    }
    responder(
      { reporteId: row.id, respuesta: text },
      {
        onSuccess: () => {
          toast.success("Respuesta enviada al empleado.");
          setRespuesta("");
        },
        onError: (error) => {
          const message =
            error instanceof ApiError
              ? error.message
              : "No pudimos enviar la respuesta.";
          toast.error(message);
        },
      },
    );
  };

  const handleFinalizar = () => {
    finalizar(
      {
        reporteId: row.id,
        conclusion: respuesta.trim() || undefined,
      },
      {
        onSuccess: () => {
          toast.success("Chat de soporte marcado como finalizado.");
          setRespuesta("");
        },
        onError: (error) => {
          const message =
            error instanceof ApiError
              ? error.message
              : "No pudimos finalizar la solicitud de soporte.";
          toast.error(message);
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
        <td className="px-3 py-3">
          <div className="font-medium text-foreground">
            {row.empleado_nombre || "—"}
          </div>
          <div className="text-xs text-muted-foreground">
            Doc. {row.empleado_documento || "—"}
          </div>
        </td>
        <td className="px-3 py-3 text-muted-foreground">
          {row.campos_reportados
            .map((campo) => CAMPO_LABELS[campo] ?? campo)
            .join(", ") || "—"}
        </td>
        <td className="px-3 py-3">
          <span
            className={cn(
              "inline-flex rounded-md px-2 py-0.5 text-xs font-medium",
              estadoTone(row.estado),
            )}
          >
            {ESTADO_LABELS[row.estado] ?? row.estado}
          </span>
        </td>
      </tr>
      {isExpanded ? (
        <tr className="border-b border-border/40 bg-muted/10">
          <td colSpan={5} className="space-y-4 px-4 py-3">
            <SoporteChatThread
              reporte={row}
              empresaNombreFallback={empresaNombreFallback}
            />

            {!isFinalizado ? (
              <div className="space-y-3 rounded-xl border border-border/50 bg-background/90 p-3.5 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-foreground">
                    Responder al empleado en este chat
                  </p>
                  <span className="text-[11px] text-muted-foreground">
                    El chat permanece activo hasta que lo finalices
                  </span>
                </div>

                <Textarea
                  value={respuesta}
                  onChange={(event) => setRespuesta(event.target.value)}
                  placeholder="Indica cómo van a corregir el dato, solicita detalles o confirma la solución..."
                  className="min-h-[85px] resize-none text-sm"
                />

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="border-emerald-500/30 text-emerald-700 hover:bg-emerald-500/10 dark:text-emerald-400"
                    disabled={isResponding || isFinalizing}
                    onClick={handleFinalizar}
                  >
                    {isFinalizing ? "Finalizando..." : "Marcar caso como finalizado"}
                  </Button>

                  <button
                    type="button"
                    disabled={
                      isResponding ||
                      isFinalizing ||
                      respuesta.trim().length < 3
                    }
                    onClick={handleResponder}
                    className="group inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#7c3aed] via-[#6366f1] to-[#2563eb] px-5 py-2 text-sm font-semibold text-white shadow-md shadow-indigo-500/25 transition-all duration-200 hover:from-[#6d28d9] hover:via-[#4f46e5] hover:to-[#1d4ed8] hover:shadow-lg hover:shadow-indigo-500/35 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
                  >
                    {isResponding ? (
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
                        <span>Enviar respuesta</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-border/40 bg-background/50 p-3 text-center text-xs text-muted-foreground">
                Caso finalizado. No requiere más respuestas.
              </div>
            )}
          </td>
        </tr>
      ) : null}
    </>
  );
}
