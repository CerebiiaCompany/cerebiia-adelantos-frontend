// ⚠️ AGNOSTIC — adelantos solicitudes API
import { http } from "../client";
import type {
  CrearSolicitudAdelantoRequest,
  EmpleadoMeDTO,
  SolicitudAdelantoDTO,
} from "../types/adelanto";

export const adelantosEndpoints = {
  /** Empleado: solo sus solicitudes. Empresa: solicitudes de toda la plantilla. */
  listSolicitudes: () =>
    http.get<SolicitudAdelantoDTO[]>("/adelantos/solicitudes/"),
  listSolicitudesEmpresa: () =>
    http.get<SolicitudAdelantoDTO[]>("/adelantos/solicitudes/"),
  createSolicitud: (data: CrearSolicitudAdelantoRequest) =>
    http.post<SolicitudAdelantoDTO>("/adelantos/solicitudes/", data),
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
