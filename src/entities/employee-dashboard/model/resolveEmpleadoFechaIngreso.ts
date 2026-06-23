import type { EmpleadoMeDTO } from "@/shared/api/types/adelanto";
import type { EmpleadoProfile } from "@/shared/api/types/auth";

/** Fecha de ingreso registrada al crear el empleado (fuente única para devengo). */
export function resolveEmpleadoFechaIngreso(
  empleadoMe?: EmpleadoMeDTO | null,
  empleado?: Pick<EmpleadoProfile, "fecha_ingreso"> | null,
): string | undefined {
  const fromApi = empleadoMe?.fecha_ingreso?.trim();
  if (fromApi) return fromApi;

  const fromSession = empleado?.fecha_ingreso?.trim();
  if (fromSession) return fromSession;

  return undefined;
}
