// ⚠️ AGNOSTIC — adelantos solicitudes API
import { http } from "../client";
import { extractPaginatedResults } from "../empleadoList";
import type { PaginatedResponse } from "../types/pagination";
import type {
  CrearSolicitudAdelantoRequest,
  EmpleadoMeDTO,
  HistorialSolicitudEmpresaDTO,
  HistorialSolicitudesEmpresaParams,
  MiSituacionFinancieraDTO,
  SolicitudAdelantoDTO,
  SolicitudDetalleDTO,
  TendenciaMensualDTO,
} from "../types/adelanto";

const HISTORIAL_MAX_PAGE_SIZE = 100;

async function fetchSolicitudesList(): Promise<SolicitudAdelantoDTO[]> {
  const response = await http.get<
    SolicitudAdelantoDTO[] | PaginatedResponse<SolicitudAdelantoDTO>
  >("/adelantos/solicitudes/");
  return extractPaginatedResults(response);
}

function buildHistorialSolicitudesEmpresaPath(
  params?: HistorialSolicitudesEmpresaParams,
): string {
  const base = "/adelantos/empresa/historial-solicitudes/";
  if (!params) return base;

  const search = new URLSearchParams();
  if (params.estado) search.set("estado", params.estado);
  if (params.fecha_desde) search.set("fecha_desde", params.fecha_desde);
  if (params.fecha_hasta) search.set("fecha_hasta", params.fecha_hasta);
  if (params.page != null) search.set("page", String(params.page));
  if (params.page_size != null) search.set("page_size", String(params.page_size));

  const query = search.toString();
  return query ? `${base}?${query}` : base;
}

async function fetchHistorialSolicitudesEmpresaPage(
  params?: HistorialSolicitudesEmpresaParams,
): Promise<PaginatedResponse<HistorialSolicitudEmpresaDTO>> {
  const response = await http.get<
    | HistorialSolicitudEmpresaDTO[]
    | PaginatedResponse<HistorialSolicitudEmpresaDTO>
  >(buildHistorialSolicitudesEmpresaPath(params));

  if (Array.isArray(response)) {
    return {
      count: response.length,
      page: 1,
      page_size: response.length || 20,
      next: null,
      previous: null,
      results: response,
    };
  }

  return response;
}

/** Carga todas las páginas del historial empresa (auditoría / monitoreo). */
async function fetchAllHistorialSolicitudesEmpresa(
  baseParams?: Omit<HistorialSolicitudesEmpresaParams, "page" | "page_size">,
): Promise<HistorialSolicitudEmpresaDTO[]> {
  const all: HistorialSolicitudEmpresaDTO[] = [];
  let page = 1;

  while (true) {
    const response = await fetchHistorialSolicitudesEmpresaPage({
      ...baseParams,
      page,
      page_size: HISTORIAL_MAX_PAGE_SIZE,
    });
    const results = extractPaginatedResults(
      response,
    ) as HistorialSolicitudEmpresaDTO[];
    all.push(...results);

    if (response.next === null || results.length === 0) break;
    page = response.next;
  }

  return all;
}

export const adelantosEndpoints = {
  /** Empleado: solo sus solicitudes. No usar con token empresa (403). */
  listSolicitudes: fetchSolicitudesList,
  /**
   * Empresa: historial de plantilla.
   * Path correcto: GET /adelantos/empresa/historial-solicitudes/
   */
  listSolicitudesEmpresa: () => fetchAllHistorialSolicitudesEmpresa(),
  listHistorialSolicitudesEmpresa: fetchAllHistorialSolicitudesEmpresa,
  getHistorialSolicitudesEmpresaPage: fetchHistorialSolicitudesEmpresaPage,
  getSolicitud: (solicitudId: string) =>
    http.get<SolicitudDetalleDTO>(`/adelantos/solicitudes/${solicitudId}/`),
  createSolicitud: (data: CrearSolicitudAdelantoRequest) =>
    http.post<SolicitudAdelantoDTO>("/adelantos/solicitudes/", data),
  miSituacionFinanciera: () =>
    http.get<MiSituacionFinancieraDTO>("/adelantos/mi-situacion-financiera/"),
  /**
   * Redundante si ya se cargó mi-situacion-financiera (incluye tendencia_mensual).
   */
  miTendenciaMensual: () =>
    http.get<TendenciaMensualDTO[]>("/adelantos/mi-tendencia-mensual/"),
  empleadoMe: () => http.get<EmpleadoMeDTO>("/empleados/me/"),
};

/** @deprecated Use adelantosEndpoints */
export const advancesEndpoints = {
  list: () => adelantosEndpoints.listSolicitudes(),
  request: (amount: number, numeroCuotas = 1) =>
    adelantosEndpoints.createSolicitud({
      monto: amount.toFixed(2),
      numero_cuotas: numeroCuotas,
    }),
};
