import { useMemo, useState } from "react";
import { AlertCircle, Loader2, Search, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiError } from "@/shared/api";
import type { EmpleadoDTO } from "@/shared/api/types";
import { formatCOP } from "@/shared/lib";
import { cn } from "@/lib/utils";
import { useEmpleadosList } from "../model/useEmpleadosList";

function formatSalario(salario: string): string {
  const amount = Number.parseFloat(salario);
  if (Number.isNaN(amount)) return salario;
  return formatCOP(amount);
}

function filterEmpleados(empleados: EmpleadoDTO[], query: string): EmpleadoDTO[] {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return empleados;

  return empleados.filter(
    (empleado) =>
      empleado.nombre.toLowerCase().includes(normalizedQuery) ||
      empleado.documento.includes(normalizedQuery),
  );
}

function EstadoBadge({ estado }: { estado: EmpleadoDTO["estado"] }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "rounded-md font-medium",
        estado === "activo"
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-amber-200 bg-amber-50 text-amber-700",
      )}
    >
      {estado === "activo" ? "Activo" : "Pre-registrado"}
    </Badge>
  );
}

function TableSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, index) => (
        <Skeleton key={index} className="h-12 w-full rounded-lg" />
      ))}
    </div>
  );
}

export function EmpleadosTable() {
  const [search, setSearch] = useState("");
  const { data, isLoading, isError, error, refetch, isFetching } =
    useEmpleadosList();

  const filteredEmpleados = useMemo(
    () => filterEmpleados(data ?? [], search),
    [data, search],
  );

  const errorMessage =
    error instanceof ApiError
      ? error.message
      : "No pudimos cargar los empleados. Inténtalo de nuevo.";

  return (
    <div className="glass-card glow-border rounded-xl p-4 sm:p-5">
      <div className="relative mb-5 max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre o documento..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="h-11 rounded-xl border-border/80 bg-background/80 pl-10"
          disabled={isLoading}
        />
      </div>

      {isLoading ? <TableSkeleton /> : null}

      {isError ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-8 text-center">
          <AlertCircle className="h-8 w-8 text-destructive" />
          <p className="text-sm text-destructive">{errorMessage}</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="text-sm font-medium text-primary hover:underline"
          >
            Reintentar
          </button>
        </div>
      ) : null}

      {!isLoading && !isError ? (
        <div className="overflow-x-auto rounded-xl border border-border/80">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/50 text-left">
                <th className="px-4 py-3 font-semibold text-muted-foreground">
                  Empleado
                </th>
                <th className="px-4 py-3 font-semibold text-muted-foreground">
                  Documento
                </th>
                <th className="px-4 py-3 font-semibold text-muted-foreground">
                  Banco
                </th>
                <th className="px-4 py-3 font-semibold text-muted-foreground">
                  Salario
                </th>
                <th className="px-4 py-3 font-semibold text-muted-foreground">
                  Estado
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredEmpleados.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center">
                    <div className="mx-auto flex max-w-sm flex-col items-center gap-2 text-muted-foreground">
                      <Users className="h-8 w-8 opacity-60" />
                      <p className="text-sm">
                        {search.trim()
                          ? "No hay empleados que coincidan con tu búsqueda."
                          : "Aún no tienes empleados registrados. Crea el primero con el botón superior."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredEmpleados.map((empleado) => (
                  <tr
                    key={empleado.id}
                    className="border-b border-border/70 last:border-0"
                  >
                    <td className="px-4 py-3.5 font-medium text-foreground">
                      {empleado.nombre}
                    </td>
                    <td className="px-4 py-3.5 font-mono text-xs text-muted-foreground">
                      {empleado.documento}
                    </td>
                    <td className="px-4 py-3.5 text-foreground">
                      {empleado.banco}
                    </td>
                    <td className="px-4 py-3.5 tabular-nums text-foreground">
                      {formatSalario(empleado.salario)}
                    </td>
                    <td className="px-4 py-3.5">
                      <EstadoBadge estado={empleado.estado} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : null}

      {isFetching && !isLoading ? (
        <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Actualizando listado...
        </div>
      ) : null}

      {!isLoading && !isError && data ? (
        <p className="mt-4 text-xs text-muted-foreground">
          {filteredEmpleados.length} de {data.length} empleado
          {data.length === 1 ? "" : "s"} mostrado
          {filteredEmpleados.length === 1 ? "" : "s"}.
        </p>
      ) : null}
    </div>
  );
}
