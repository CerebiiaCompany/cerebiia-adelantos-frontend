// ⚠️ AGNOSTIC — normaliza respuestas de GET /empleados/bancos/

import { extractPaginatedResults } from "./empleadoList";
import type { BancoDTO } from "./types/empleado";

function isBancoDTO(value: unknown): value is BancoDTO {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.id === "string" &&
    typeof candidate.nombre === "string" &&
    candidate.nombre.trim().length > 0
  );
}

/** Acepta array plano, paginado u objetos envueltos del backend. */
export function normalizeBancosList(data: unknown): BancoDTO[] {
  const fromPaginated = extractPaginatedResults<BancoDTO>(data);
  if (fromPaginated.length > 0) {
    return fromPaginated.filter(isBancoDTO);
  }

  if (Array.isArray(data)) {
    return data.filter(isBancoDTO);
  }

  if (data && typeof data === "object") {
    const record = data as Record<string, unknown>;
    if (Array.isArray(record.bancos)) {
      return record.bancos.filter(isBancoDTO);
    }
    if (Array.isArray(record.data)) {
      return record.data.filter(isBancoDTO);
    }
  }

  return [];
}
