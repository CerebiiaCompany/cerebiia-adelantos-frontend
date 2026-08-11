import { useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronRight, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useProfileView } from "@/features/auth";
import { useReportesDatoIncorrectoMe } from "@/features/soporte/model/useReportesDatoIncorrectoMe";
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
        <div className="overflow-hidden rounded-xl border border-border/60">
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
                    <SupportRow
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
      )}

      {totalCount > pageSize ? (
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            Página {page} de {totalPages} · {totalCount} solicitudes
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

function SupportRow({
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
          <td colSpan={4} className="px-4 py-3">
            <SoporteChatThread
              reporte={row}
              empresaNombreFallback={empresaNombreFallback}
            />
          </td>
        </tr>
      ) : null}
    </>
  );
}
