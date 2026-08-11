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
  resuelto: "Resuelto",
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
  if (estado === "respondido" || estado === "resuelto") {
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
  const { mutate: responder, isPending } = useResponderReporteDatoIncorrecto();
  const yaRespondido = Boolean(row.respuesta_empresa?.trim()) || row.estado === "respondido";

  const handleResponder = () => {
    const text = respuesta.trim();
    if (text.length < 5) {
      toast.error("La respuesta debe tener al menos 5 caracteres.");
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
            {!yaRespondido ? (
              <div className="space-y-2 rounded-xl border border-border/50 bg-background/80 p-3">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Responder al empleado
                </p>
                <Textarea
                  value={respuesta}
                  onChange={(event) => setRespuesta(event.target.value)}
                  placeholder="Indica cómo van a corregir el dato o qué información necesitan..."
                  className="min-h-[90px] resize-none"
                />
                <PrimaryActionButton
                  type="button"
                  showArrow={false}
                  className="w-full sm:w-auto"
                  loading={isPending}
                  loadingText="Enviando..."
                  disabled={isPending || respuesta.trim().length < 5}
                  onClick={handleResponder}
                >
                  Enviar respuesta
                </PrimaryActionButton>
              </div>
            ) : null}
          </td>
        </tr>
      ) : null}
    </>
  );
}
