import type { EmpleadoDTO } from "@/shared/api/types";

type DeactivateEmpleadoButtonProps = {
  empleado: EmpleadoDTO;
};

/**
 * El backend aún no expone POST /empleados/{id}/desactivar/.
 */
export function DeactivateEmpleadoButton({
  empleado: _empleado,
}: DeactivateEmpleadoButtonProps) {
  return (
    <span
      className="text-xs text-muted-foreground"
      title="Próximamente cuando el backend habilite esta acción"
    >
      —
    </span>
  );
}
