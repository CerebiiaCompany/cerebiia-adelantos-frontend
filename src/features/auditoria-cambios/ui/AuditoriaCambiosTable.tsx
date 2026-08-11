import { useMemo, useState } from "react";
import { ChevronDown, ChevronRight, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import type { AuditoriaCambioEmpleadoDTO } from "@/shared/api/types/empleado";
import { cn } from "@/lib/utils";

const ACCION_LABELS: Record<string, string> = {
  confirmacion_activacion: "Confirmación en activación",
  actualizacion_propia: "Actualización del empleado",
  actualizacion_empresa: "Actualización por la empresa",
};

const ACTOR_LABELS: Record<string, string> = {
  empleado: "Empleado",
  empresa: "Empresa",
  sistema: "Sistema",
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

function displayValue(value: string): string {
  const trimmed = (value ?? "").trim();
  return trimmed.length > 0 ? trimmed : "—";
}

function TableSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, index) => (
        <Skeleton key={index} className="h-14 w-full rounded-lg" />
      ))}
    </div>
  );
}

export interface AuditoriaCambiosTableProps {
  records: AuditoriaCambioEmpleadoDTO[];
  isLoading: boolean;
  isError: boolean;
  onRetry?: () => void;
  /** Mostrar columna de empleado (vista empresa). */
  showEmployeeColumn?: boolean;
  emptyMessage?: string;
  page: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (page: number) => void;
}

export function AuditoriaCambiosTable({
  records,
  isLoading,
  isError,
  onRetry,
  showEmployeeColumn = false,
  emptyMessage = "Aún no hay cambios registrados.",
  page,
  pageSize,
  totalCount,
  onPageChange,
}: AuditoriaCambiosTableProps) {
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return records;
    return records.filter((row) => {
      const haystack = [
        row.empleado_nombre,
        row.empleado_documento,
        row.actor_nombre,
        row.accion,
        ACCION_LABELS[row.accion] ?? "",
        ...row.cambios.flatMap((c) => [
          c.etiqueta,
          c.valor_anterior,
          c.valor_nuevo,
        ]),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(term);
    });
  }, [records, search]);

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  if (isLoading) return <TableSkeleton />;

  if (isError) {
    return (
      <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-8 text-center">
        <p className="text-sm font-medium text-foreground">
          No se pudo cargar el historial de auditoría.
        </p>
        {onRetry ? (
          <button
            type="button"
            onClick={onRetry}
            className="mt-2 text-sm font-medium text-primary hover:underline"
          >
            Reintentar
          </button>
        ) : null}
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
          placeholder={
            showEmployeeColumn
              ? "Buscar por empleado, campo o actor..."
              : "Buscar por campo, valor o actor..."
          }
          className="pl-9"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-border/60 bg-muted/20 px-4 py-10 text-center text-sm text-muted-foreground">
          {records.length === 0 ? emptyMessage : "No hay resultados para tu búsqueda."}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border/60">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-border/60 bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="w-10 px-3 py-3" />
                  <th className="px-3 py-3 font-medium">Fecha</th>
                  {showEmployeeColumn ? (
                    <th className="px-3 py-3 font-medium">Empleado</th>
                  ) : null}
                  <th className="px-3 py-3 font-medium">Acción</th>
                  <th className="px-3 py-3 font-medium">Realizado por</th>
                  <th className="px-3 py-3 font-medium">Cambios</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => {
                  const isExpanded = expandedId === row.id;
                  return (
                    <FragmentRow
                      key={row.id}
                      row={row}
                      isExpanded={isExpanded}
                      showEmployeeColumn={showEmployeeColumn}
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
            Página {page} de {totalPages} · {totalCount} registros
          </p>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
            >
              Anterior
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
            >
              Siguiente
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function FragmentRow({
  row,
  isExpanded,
  showEmployeeColumn,
  onToggle,
}: {
  row: AuditoriaCambioEmpleadoDTO;
  isExpanded: boolean;
  showEmployeeColumn: boolean;
  onToggle: () => void;
}) {
  const colSpan = showEmployeeColumn ? 6 : 5;

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
        <td className="whitespace-nowrap px-3 py-3 text-foreground">
          {formatDateTime(row.created_at)}
        </td>
        {showEmployeeColumn ? (
          <td className="px-3 py-3">
            <div className="font-medium text-foreground">
              {row.empleado_nombre || "—"}
            </div>
            <div className="text-xs text-muted-foreground">
              Doc. {row.empleado_documento || "—"}
            </div>
          </td>
        ) : null}
        <td className="px-3 py-3 text-foreground">
          {ACCION_LABELS[row.accion] ?? row.accion}
        </td>
        <td className="px-3 py-3">
          <div className="text-foreground">{row.actor_nombre || "—"}</div>
          <div className="text-xs text-muted-foreground">
            {ACTOR_LABELS[row.actor_tipo] ?? row.actor_tipo}
          </div>
        </td>
        <td className="px-3 py-3 text-muted-foreground">
          {row.cambios.length} campo{row.cambios.length === 1 ? "" : "s"}
        </td>
      </tr>
      {isExpanded ? (
        <tr className="border-b border-border/40 bg-muted/10">
          <td colSpan={colSpan} className="px-4 py-3">
            <div className="overflow-hidden rounded-lg border border-border/50">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2 font-medium">Campo</th>
                    <th className="px-3 py-2 font-medium">Antes</th>
                    <th className="px-3 py-2 font-medium">Después</th>
                  </tr>
                </thead>
                <tbody>
                  {row.cambios.map((cambio) => (
                    <tr
                      key={`${row.id}-${cambio.campo}`}
                      className="border-t border-border/40"
                    >
                      <td className="px-3 py-2 font-medium text-foreground">
                        {cambio.etiqueta || cambio.campo}
                      </td>
                      <td className="px-3 py-2 text-muted-foreground">
                        {displayValue(cambio.valor_anterior)}
                      </td>
                      <td className="px-3 py-2 text-foreground">
                        {displayValue(cambio.valor_nuevo)}
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
