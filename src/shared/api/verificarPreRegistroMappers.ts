// ⚠️ AGNOSTIC — normaliza respuesta de POST /empleados/verificar-pre-registro/

import type { VerificarPreRegistroResponse } from "./types/empleado";

export function normalizeVerificarPreRegistroResponse(
  data: unknown,
): VerificarPreRegistroResponse {
  const record =
    data && typeof data === "object"
      ? (data as Record<string, unknown>)
      : {};

  return {
    existe: record.existe === true,
    nombre: typeof record.nombre === "string" ? record.nombre : "",
    ya_activo: record.ya_activo === true,
  };
}
