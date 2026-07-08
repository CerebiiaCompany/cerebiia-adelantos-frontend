// ⚠️ AGNOSTIC — adelantos solicitudes API
import { http } from "../client";
import { extractPaginatedResults } from "../empleadoList";
import type { PaginatedResponse } from "../types/pagination";
import type {
  CrearSolicitudAdelantoRequest,
  EmpleadoMeDTO,
  MiSituacionFinancieraDTO,
  SolicitudAdelantoDTO,
  SolicitudDetalleDTO,
  TendenciaMensualDTO,
} from "../types/adelanto";

async function fetchSolicitudesList(): Promise<SolicitudAdelantoDTO[]> {
  const response = await http.get<
    SolicitudAdelantoDTO[] | PaginatedResponse<SolicitudAdelantoDTO>
  >("/adelantos/solicitudes/");
  return extractPaginatedResults(response);
}

export const adelantosEndpoints = {
  /** Empleado: solo sus solicitudes. Empresa: solicitudes de toda la plantilla. */
  listSolicitudes: fetchSolicitudesList,
  /** Empresa: solicitudes de toda la plantilla (GET con token empresa). */
  listSolicitudesEmpresa: fetchSolicitudesList,
  getSolicitud: (solicitudId: string) =>
    http.get<SolicitudDetalleDTO>(`/adelantos/solicitudes/${solicitudId}/`),
  createSolicitud: (data: CrearSolicitudAdelantoRequest) =>
    http.post<SolicitudAdelantoDTO>("/adelantos/solicitudes/", data),
  cancelSolicitud: (solicitudId: string) =>
    http.post<SolicitudAdelantoDTO>(
      `/adelantos/solicitudes/${solicitudId}/cancelar/`,
      {},
    ),
  miSituacionFinanciera: () =>
    http.get<MiSituacionFinancieraDTO>("/adelantos/mi-situacion-financiera/"),
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
