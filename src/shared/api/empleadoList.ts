// ⚠️ AGNOSTIC — helpers for paginated empleados list

import type { EmpleadoDTO } from "./types/empleado";
import type { PaginatedResponse } from "./types/pagination";

export interface EmpleadosListParams {
  nombre?: string;
  email?: string;
  documento?: string;
  estado?: "pre_registrado" | "activo" | "inactivo";
  page?: number;
  page_size?: number;
}

const MAX_PAGE_SIZE = 100;

export function buildEmpleadosListPath(params?: EmpleadosListParams): string {
  if (!params) return "/empleados/";

  const search = new URLSearchParams();
  if (params.nombre) search.set("nombre", params.nombre);
  if (params.email) search.set("email", params.email);
  if (params.documento) search.set("documento", params.documento);
  if (params.estado) search.set("estado", params.estado);
  if (params.page != null) search.set("page", String(params.page));
  if (params.page_size != null) search.set("page_size", String(params.page_size));

  const query = search.toString();
  return query ? `/empleados/?${query}` : "/empleados/";
}

/** Normaliza respuestas paginadas o arrays planos a un array de resultados. */
export function extractPaginatedResults<T>(
  data: T[] | PaginatedResponse<T> | unknown,
): T[] {
  if (Array.isArray(data)) return data;

  if (
    data &&
    typeof data === "object" &&
    "results" in data &&
    Array.isArray((data as PaginatedResponse<T>).results)
  ) {
    return (data as PaginatedResponse<T>).results;
  }

  return [];
}

export async function fetchAllEmpleadosPages(
  listPage: (params: EmpleadosListParams) => Promise<PaginatedResponse<EmpleadoDTO>>,
  baseParams?: Omit<EmpleadosListParams, "page" | "page_size">,
): Promise<EmpleadoDTO[]> {
  const all: EmpleadoDTO[] = [];
  let page = 1;

  while (true) {
    const response = await listPage({
      ...baseParams,
      page,
      page_size: MAX_PAGE_SIZE,
    });
    const results = extractPaginatedResults(response);
    all.push(...results);

    if (response.next === null || results.length === 0) break;
    page = response.next;
  }

  return all;
}
