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
  listPage: (params: EmpleadosListParams) => Promise<PaginatedResponse<EmpleadoDTO> | EmpleadoDTO[]>,
  baseParams?: Omit<EmpleadosListParams, "page" | "page_size">,
): Promise<EmpleadoDTO[]> {
  const all: EmpleadoDTO[] = [];
  let currentPage = 1;
  const maxIterations = 50;

  for (let iter = 0; iter < maxIterations; iter += 1) {
    const response = await listPage({
      ...baseParams,
      page: currentPage,
      page_size: MAX_PAGE_SIZE,
    });

    if (Array.isArray(response)) {
      return response;
    }

    const results = extractPaginatedResults(response);
    all.push(...results);

    // Si no hay más páginas, no hay campo next, o los resultados están vacíos
    if (!response || !response.next || results.length === 0) {
      break;
    }

    if (typeof response.next === "number") {
      if (response.next <= currentPage) break;
      currentPage = response.next;
    } else if (typeof response.next === "string") {
      try {
        const parsedUrl = new URL(response.next, "http://localhost");
        const nextPageParam = parsedUrl.searchParams.get("page");
        const parsedPage = nextPageParam ? Number.parseInt(nextPageParam, 10) : Number.NaN;
        if (!Number.isNaN(parsedPage) && parsedPage > currentPage) {
          currentPage = parsedPage;
        } else {
          currentPage += 1;
        }
      } catch {
        currentPage += 1;
      }
    } else {
      break;
    }
  }

  return all;
}

export async function fetchEmpleadoDocumentoExists(
  list: (params: EmpleadosListParams) => Promise<PaginatedResponse<EmpleadoDTO>>,
  documento: string,
): Promise<boolean> {
  const trimmed = documento.trim();
  if (!trimmed) return false;

  const response = await list({
    documento: trimmed,
    page: 1,
    page_size: 20,
  });
  const results = extractPaginatedResults(response);

  return results.some((empleado) => empleado.documento === trimmed);
}
