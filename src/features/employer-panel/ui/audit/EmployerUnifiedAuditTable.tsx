import { useMemo, useState } from "react";
import { ChevronDown, ChevronRight, ChevronUp, FileCheck2, Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { AdvancePaymentEvidenceDialog } from "@/features/advance/ui/AdvancePaymentEvidenceDialog";
import type {
  EmployerAuditCategory,
  EmployerUnifiedAuditRecord,
} from "@/entities/employer-audit";
import { formatCOP } from "@/shared/lib";
import { cn } from "@/lib/utils";

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

function getToneStyles(
  tone: "success" | "warning" | "danger" | "info" | "purple" | "neutral",
) {
  switch (tone) {
    case "success":
      return "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";
    case "warning":
      return "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400";
    case "danger":
      return "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400";
    case "info":
      return "border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400";
    case "purple":
      return "border-purple-500/30 bg-purple-500/10 text-purple-600 dark:text-purple-400";
    default:
      return "border-border bg-secondary/50 text-muted-foreground";
  }
}

function getLocalDateString(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getTodayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function TableSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-14 w-full rounded-xl" />
      ))}
    </div>
  );
}

export interface EmployerUnifiedAuditTableProps {
  records: EmployerUnifiedAuditRecord[];
  isLoading: boolean;
  isError: boolean;
  onRetry?: () => void;
}

export function EmployerUnifiedAuditTable({
  records,
  isLoading,
  isError,
  onRetry,
}: EmployerUnifiedAuditTableProps) {
  const [category, setCategory] = useState<EmployerAuditCategory>("todos");
  const [search, setSearch] = useState("");
  const todayStr = useMemo(() => getTodayDateString(), []);
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [evidenceUrl, setEvidenceUrl] = useState<string | null>(null);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const hasActiveFilters = Boolean(
    search || (selectedDate && selectedDate !== todayStr) || category !== "todos",
  );

  const filteredRecords = useMemo(() => {
    let result = records;
    if (category !== "todos") {
      result = result.filter((r) => r.category === category);
    }
    if (selectedDate) {
      result = result.filter(
        (r) => getLocalDateString(r.timestamp) === selectedDate,
      );
    }
    const q = search.trim().toLowerCase();
    if (q) {
      result = result.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          r.actorNombre.toLowerCase().includes(q) ||
          (r.employeeName && r.employeeName.toLowerCase().includes(q)) ||
          (r.employeeDocument && r.employeeDocument.includes(q)) ||
          r.statusBadge.label.toLowerCase().includes(q) ||
          (r.solicitudId && r.solicitudId.toLowerCase().includes(q)) ||
          (r.amount && String(r.amount).includes(q)),
      );
    }
    return result;
  }, [records, category, selectedDate, search]);

  return (
    <div className="space-y-4">
      {/* Botón de Filtros en Móvil */}
      <div className="flex items-center justify-between sm:hidden">
        <button
          type="button"
          onClick={() => setIsFiltersOpen((prev) => !prev)}
          className="inline-flex items-center gap-2 rounded-xl border border-border/80 bg-background/80 px-3.5 py-2 text-xs font-semibold text-foreground shadow-sm"
        >
          <SlidersHorizontal className="h-3.5 w-3.5 text-primary" />
          <span>Filtros</span>
          {hasActiveFilters && (
            <span className="h-2 w-2 rounded-full bg-primary" aria-hidden />
          )}
          {isFiltersOpen ? (
            <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          )}
        </button>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setSelectedDate(todayStr);
              setCategory("todos");
            }}
            className="text-xs font-medium text-muted-foreground hover:text-foreground hover:underline"
          >
            Restablecer
          </button>
        )}
      </div>

      {/* Barra de Filtros: Buscador + Filtro por Fecha + Selector de categorías */}
      <div
        className={cn(
          "flex-col gap-3 lg:flex-row lg:items-center lg:justify-between",
          isFiltersOpen ? "flex" : "hidden sm:flex",
        )}
      >
        <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative max-w-sm flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por empleado, documento, evento..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 rounded-xl border-border/80 bg-background pl-9 text-sm"
            />
          </div>

          <div className="flex items-center gap-2">
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="h-10 w-44 rounded-xl border-border/80 bg-background text-xs sm:text-sm font-medium"
              title="Filtrar por fecha específica"
            />

            {selectedDate ? (
              <button
                type="button"
                onClick={() => setSelectedDate("")}
                className="whitespace-nowrap text-xs font-medium text-muted-foreground hover:text-foreground hover:underline"
              >
                Todas las fechas
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setSelectedDate(todayStr)}
                className="rounded-lg border border-border/80 bg-secondary/50 px-2.5 py-1.5 text-xs font-semibold text-foreground hover:bg-secondary"
              >
                Ver hoy
              </button>
            )}
          </div>
        </div>

        <div className="inline-flex flex-wrap rounded-xl border border-border/80 bg-secondary/30 p-1 text-xs">
          <button
            type="button"
            onClick={() => setCategory("todos")}
            className={cn(
              "rounded-lg px-3 py-1.5 font-medium transition-all",
              category === "todos"
                ? "bg-background font-semibold text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            Todos ({records.length})
          </button>
          <button
            type="button"
            onClick={() => setCategory("adelantos")}
            className={cn(
              "rounded-lg px-3 py-1.5 font-medium transition-all",
              category === "adelantos"
                ? "bg-background font-semibold text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            Adelantos ({records.filter((r) => r.category === "adelantos").length})
          </button>
          <button
            type="button"
            onClick={() => setCategory("cuotas")}
            className={cn(
              "rounded-lg px-3 py-1.5 font-medium transition-all",
              category === "cuotas"
                ? "bg-background font-semibold text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            Cuotas y Nómina ({records.filter((r) => r.category === "cuotas").length})
          </button>
          <button
            type="button"
            onClick={() => setCategory("configuracion")}
            className={cn(
              "rounded-lg px-3 py-1.5 font-medium transition-all",
              category === "configuracion"
                ? "bg-background font-semibold text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            Configuración ({records.filter((r) => r.category === "configuracion").length})
          </button>
          <button
            type="button"
            onClick={() => setCategory("empleados")}
            className={cn(
              "rounded-lg px-3 py-1.5 font-medium transition-all",
              category === "empleados"
                ? "bg-background font-semibold text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            Datos de Empleados ({records.filter((r) => r.category === "empleados").length})
          </button>
        </div>
      </div>

      {isLoading ? (
        <TableSkeleton />
      ) : isError ? (
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-8 text-center">
          <p className="text-sm font-medium text-foreground">
            No se pudo cargar el historial de auditorías.
          </p>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="mt-2 text-sm font-medium text-primary hover:underline"
            >
              Reintentar
            </button>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border/80 bg-background">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[840px] text-left text-sm">
              <thead className="border-b border-border/60 bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="w-10 px-3 py-3" />
                  <th className="px-3 py-3 font-medium">Fecha</th>
                  <th className="px-3 py-3 font-medium">Empleado</th>
                  <th className="px-3 py-3 font-medium">Acción</th>
                  <th className="px-3 py-3 font-medium">Realizado por</th>
                  <th className="px-3 py-3 font-medium text-center">Estado</th>
                  <th className="px-3 py-3 font-medium text-right">Detalles</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-12 text-center text-sm text-muted-foreground"
                    >
                      No hay eventos auditados para los filtros seleccionados.
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((row) => {
                    const isExpanded = expandedId === row.id;
                    return (
                      <EmployerAuditRowItem
                        key={row.id}
                        record={row}
                        isExpanded={isExpanded}
                        onToggle={() =>
                          setExpandedId(isExpanded ? null : row.id)
                        }
                        onViewEvidence={(url) => setEvidenceUrl(url)}
                      />
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal de Evidencia de Pago */}
      <AdvancePaymentEvidenceDialog
        open={Boolean(evidenceUrl)}
        onOpenChange={(open) => {
          if (!open) setEvidenceUrl(null);
        }}
        evidenceUrl={evidenceUrl}
      />
    </div>
  );
}

function EmployerAuditRowItem({
  record,
  isExpanded,
  onToggle,
  onViewEvidence,
}: {
  record: EmployerUnifiedAuditRecord;
  isExpanded: boolean;
  onToggle: () => void;
  onViewEvidence: (url: string) => void;
}) {
  return (
    <>
      <tr
        className={cn(
          "border-b border-border/40 transition-colors hover:bg-muted/30 last:border-0",
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
          {formatDateTime(record.timestamp)}
        </td>

        <td className="px-3 py-3">
          {record.employeeName ? (
            <div>
              <div className="font-medium text-foreground">
                {record.employeeName}
              </div>
              <div className="font-mono text-xs text-muted-foreground">
                Doc. {record.employeeDocument || "—"}
              </div>
            </div>
          ) : (
            <span className="text-xs font-medium text-muted-foreground">
              Toda la empresa (Global)
            </span>
          )}
        </td>

        <td className="px-3 py-3">
          <div className="font-medium text-foreground">{record.title}</div>
          <div className="text-xs text-muted-foreground">
            {record.description}
          </div>
        </td>

        <td className="px-3 py-3">
          <div className="text-foreground">{record.actorNombre}</div>
          <div className="text-xs text-muted-foreground capitalize">
            {record.actorTipo}
          </div>
        </td>

        <td className="px-3 py-3 text-center">
          <span
            className={cn(
              "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",
              getToneStyles(record.statusBadge.tone),
            )}
          >
            {record.statusBadge.label}
          </span>
        </td>

        <td className="px-3 py-3 text-right">
          {record.evidenceUrl ? (
            <button
              type="button"
              onClick={() => onViewEvidence(record.evidenceUrl!)}
              className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              <FileCheck2 className="h-3.5 w-3.5" />
              Ver evidencia
            </button>
          ) : (
            <button
              type="button"
              onClick={onToggle}
              className="text-xs text-muted-foreground hover:text-foreground hover:underline"
            >
              {isExpanded ? "Ocultar" : "Detalle"}
            </button>
          )}
        </td>
      </tr>

      {isExpanded ? (
        <tr className="border-b border-border/40 bg-muted/10">
          <td colSpan={7} className="px-4 py-3">
            <div className="overflow-hidden rounded-lg border border-border/50 bg-background/50">
              {record.profileChanges && record.profileChanges.length > 0 ? (
                <table className="w-full text-sm">
                  <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                    <tr>
                      <th className="px-3 py-2 font-medium">Campo</th>
                      <th className="px-3 py-2 font-medium">Antes</th>
                      <th className="px-3 py-2 font-medium">Después</th>
                    </tr>
                  </thead>
                  <tbody>
                    {record.profileChanges.map((c, index) => (
                      <tr key={index} className="border-t border-border/40">
                        <td className="px-3 py-2 font-medium text-foreground">
                          {c.etiqueta || c.campo}
                        </td>
                        <td className="px-3 py-2 text-muted-foreground">
                          {c.valor_anterior || "—"}
                        </td>
                        <td className="px-3 py-2 text-foreground font-semibold">
                          {c.valor_nuevo || "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : record.configDetails ? (
                <div className="p-3 text-xs space-y-3">
                  <div className="flex items-center justify-between border-b border-border/60 pb-2">
                    <span className="font-semibold uppercase tracking-wider text-muted-foreground">
                      Alcance de la configuración
                    </span>
                    <span className="rounded-md border border-border bg-secondary/40 px-2.5 py-0.5 text-xs font-semibold capitalize text-foreground">
                      {record.configDetails.scope === "global"
                        ? "Global (aplica a la empresa)"
                        : "Personalizada"}
                    </span>
                  </div>

                  <table className="w-full text-sm">
                    <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                      <tr>
                        <th className="px-3 py-2 font-medium">Parámetro</th>
                        <th className="px-3 py-2 font-medium">Valor configurado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {record.configDetails.parameters.map((p, index) => (
                        <tr key={index} className="border-t border-border/40">
                          <td className="px-3 py-2 font-medium text-foreground">
                            {p.parameter}
                          </td>
                          <td className="px-3 py-2 font-semibold text-foreground">
                            {p.value}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : record.eventType === "cuota_liberada" ? (
                <table className="w-full text-sm">
                  <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                    <tr>
                      <th className="px-3 py-2 font-medium">Concepto</th>
                      <th className="px-3 py-2 font-medium">Empleado</th>
                      <th className="px-3 py-2 font-medium">Cuota</th>
                      <th className="px-3 py-2 font-medium text-right">Valor liberado</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t border-border/40">
                      <td className="px-3 py-2 font-medium text-foreground">
                        Liberación de retención en nómina
                      </td>
                      <td className="px-3 py-2 text-muted-foreground">
                        {record.employeeName}
                      </td>
                      <td className="px-3 py-2 text-foreground font-medium">
                        Cuota #{record.currentInstallment} de {record.installments}
                      </td>
                      <td className="px-3 py-2 text-right font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
                        {formatCOP(record.amount ?? 0)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              ) : (
                <div className="p-3 text-xs space-y-2">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {record.amount && (
                      <div>
                        <p className="text-[11px] uppercase font-semibold text-muted-foreground">
                          Monto solicitado
                        </p>
                        <p className="font-semibold text-foreground">
                          {formatCOP(record.amount)}
                        </p>
                      </div>
                    )}
                    {record.netAmount && (
                      <div>
                        <p className="text-[11px] uppercase font-semibold text-muted-foreground">
                          Neto transferido
                        </p>
                        <p className="font-semibold text-foreground">
                          {formatCOP(record.netAmount)}
                        </p>
                      </div>
                    )}
                    {record.installments && (
                      <div>
                        <p className="text-[11px] uppercase font-semibold text-muted-foreground">
                          Cuotas
                        </p>
                        <p className="font-semibold text-foreground">
                          {record.installments}
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="text-[11px] uppercase font-semibold text-muted-foreground">
                        Fecha y hora
                      </p>
                      <p className="text-foreground">
                        {formatDateTime(record.timestamp)}
                      </p>
                    </div>
                  </div>

                  {record.rejectionReason && (
                    <div className="mt-2 rounded-md border border-rose-500/20 bg-rose-500/10 p-2.5 text-rose-600 dark:text-rose-400">
                      <strong>Motivo de rechazo:</strong> {record.rejectionReason}
                    </div>
                  )}
                </div>
              )}
            </div>
          </td>
        </tr>
      ) : null}
    </>
  );
}
