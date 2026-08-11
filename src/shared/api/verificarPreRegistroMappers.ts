// ⚠️ AGNOSTIC — normaliza respuesta de POST /empleados/verificar-pre-registro/

import type { VerificarPreRegistroResponse } from "./types/empleado";

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

export function normalizeVerificarPreRegistroResponse(
  data: unknown,
): VerificarPreRegistroResponse {
  const record =
    data && typeof data === "object"
      ? (data as Record<string, unknown>)
      : {};

  return {
    existe: record.existe === true,
    nombre: asString(record.nombre),
    ya_activo: record.ya_activo === true,
    documento: asString(record.documento),
    tipo_documento: asString(record.tipo_documento),
    celular: asString(record.celular),
    banco_id: asString(record.banco_id),
    banco_nombre: asString(record.banco_nombre),
    tipo_cuenta: asString(record.tipo_cuenta),
    numero_cuenta: asString(record.numero_cuenta),
  };
}

/** Parte el nombre completo en nombres / apellidos para el formulario de confirmación. */
export function splitNombreCompleto(nombre: string): {
  nombres: string;
  apellidos: string;
} {
  const parts = nombre.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { nombres: "", apellidos: "" };
  if (parts.length === 1) return { nombres: parts[0], apellidos: "" };
  const mid = Math.ceil(parts.length / 2);
  return {
    nombres: parts.slice(0, mid).join(" "),
    apellidos: parts.slice(mid).join(" "),
  };
}

export function joinNombreCompleto(nombres: string, apellidos: string): string {
  return `${nombres.trim()} ${apellidos.trim()}`.trim();
}
