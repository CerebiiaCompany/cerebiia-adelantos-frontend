import { useMemo, useState } from "react";
import { Loader2, Pencil, Search, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import type { EmpleadoDTO } from "@/shared/api/types";
import { formatCOP } from "@/shared/lib";
import {
  formatEmpleadoCell,
  formatFechaIngreso,
  formatTipoContrato,
  formatTipoCuenta,
  formatTipoDocumento,
} from "@/shared/utils/empleadoDisplayLabels";
import { cn } from "@/lib/utils";
import { useEmpleadosList } from "../model/useEmpleadosList";
import { DeactivateEmpleadoButton } from "./DeactivateEmpleadoButton";
import { EditEmpleadoDialog } from "./EditEmpleadoDialog";
import { EmployerPanelUnavailableNotice } from "./EmployerPanelUnavailableNotice";

const TABLE_COLUMNS = [
  { key: "nombre", label: "Nombre" },
  { key: "tipo_documento", label: "Tipo doc." },
  { key: "documento", label: "Documento" },
  { key: "salario", label: "Salario" },
  { key: "banco_nombre", label: "Banco" },
  { key: "numero_cuenta", label: "No. cuenta" },
  { key: "tipo_cuenta", label: "Tipo cuenta" },
  { key: "email_empleado", label: "Email" },
  { key: "celular", label: "Celular" },
  { key: "tipo_contrato", label: "Tipo contrato" },
  { key: "fecha_ingreso", label: "Fecha ingreso" },
  { key: "estado", label: "Estado" },
  { key: "acciones", label: "Acciones" },
] as const;

function formatSalario(salario: string): string {
  const amount = Number.parseFloat(salario);
  if (Number.isNaN(amount)) return salario;
  return formatCOP(amount);
}

function filterEmpleados(empleados: EmpleadoDTO[], query: string): EmpleadoDTO[] {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return empleados;

  return empleados.filter((empleado) => {
    const haystack = [
      empleado.nombre,
      empleado.documento,
      empleado.email_empleado,
      empleado.celular,
      empleado.banco_nombre,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return haystack.includes(normalizedQuery);
  });
}

function EstadoBadge({ estado }: { estado: EmpleadoDTO["estado"] | "inactivo" }) {
  const styles =
    estado === "activo"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : estado === "inactivo"
        ? "border-red-200 bg-red-50 text-red-700"
        : "border-amber-200 bg-amber-50 text-amber-700";

  const label =
    estado === "activo"
      ? "Activo"
      : estado === "inactivo"
        ? "Inactivo"
        : "Pre-registrado";

  return (
    <Badge variant="outline" className={cn("rounded-md font-medium", styles)}>
      {label}
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
  const [empleadoToEdit, setEmpleadoToEdit] = useState<EmpleadoDTO | null>(null);
  const { data, isLoading, isError, refetch, isFetching } =
    useEmpleadosList();

  const filteredEmpleados = useMemo(
    () => filterEmpleados(data ?? [], search),
    [data, search],
  );

  return (
    <div className="glass-card glow-border rounded-xl p-4 sm:p-5">
      <div className="relative mb-5 max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre, documento, email o celular..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="h-11 rounded-xl border-border/80 bg-background/80 pl-10"
          disabled={isLoading}
        />
      </div>

      {isLoading ? <TableSkeleton /> : null}

      {isError ? (
        <EmployerPanelUnavailableNotice
          message="No hay información de empleados disponible en este momento."
          description="Puedes reintentar la consulta o volver más tarde."
          onRetry={() => refetch()}
        />
      ) : null}

      {!isLoading && !isError ? (
        <div className="overflow-x-auto rounded-xl border border-border/80">
          <table className="w-full min-w-[1400px] text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/50 text-left">
                {TABLE_COLUMNS.map((column) => (
                  <th
                    key={column.key}
                    className="whitespace-nowrap px-3 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                  >
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredEmpleados.length === 0 ? (
                <tr>
                  <td
                    colSpan={TABLE_COLUMNS.length}
                    className="px-4 py-10 text-center"
                  >
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
                    <td className="whitespace-nowrap px-3 py-3.5 font-medium text-foreground">
                      {empleado.nombre}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3.5 text-foreground">
                      {formatTipoDocumento(empleado.tipo_documento)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3.5 font-mono text-xs text-muted-foreground">
                      {empleado.documento}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3.5 tabular-nums text-foreground">
                      {formatSalario(empleado.salario)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3.5 text-foreground">
                      {formatEmpleadoCell(empleado.banco_nombre)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3.5 font-mono text-xs text-foreground">
                      {formatEmpleadoCell(empleado.numero_cuenta)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3.5 text-foreground">
                      {formatTipoCuenta(empleado.tipo_cuenta)}
                    </td>
                    <td className="max-w-[200px] truncate px-3 py-3.5 text-foreground">
                      {formatEmpleadoCell(empleado.email_empleado)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3.5 font-mono text-xs text-foreground">
                      {formatEmpleadoCell(empleado.celular)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3.5 text-foreground">
                      {formatTipoContrato(empleado.tipo_contrato)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3.5 text-foreground">
                      {formatFechaIngreso(empleado.fecha_ingreso)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3.5">
                      <EstadoBadge estado={empleado.estado} />
                    </td>
                    <td className="whitespace-nowrap px-3 py-3.5">
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-8 gap-1.5 rounded-lg px-2 text-xs font-medium text-primary hover:bg-primary/5"
                          onClick={() => setEmpleadoToEdit(empleado)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Editar
                        </Button>
                        <DeactivateEmpleadoButton empleado={empleado} />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : null}

      <EditEmpleadoDialog
        empleado={empleadoToEdit}
        open={empleadoToEdit !== null}
        onOpenChange={(open) => {
          if (!open) setEmpleadoToEdit(null);
        }}
      />

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
