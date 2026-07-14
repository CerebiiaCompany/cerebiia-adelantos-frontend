// ⚠️ AGNOSTIC — no react-router-dom, no react-dom, no UI imports

import { normalizeBancosList } from "../bancosMappers";
import { normalizeVerificarPreRegistroResponse } from "../verificarPreRegistroMappers";
import {
  buildEmpleadosListPath,
  type EmpleadosListParams,
} from "../empleadoList";
import { http } from "../client";
import type { PaginatedResponse } from "../types/pagination";
import type {
  EmpleadoLoginRequest,
  EmpleadoLoginResponse,
} from "../types/auth";
import type {
  ActivarEmpleadoRequest,
  ActivarEmpleadoResponse,
  BancoDTO,
  CreateEmpleadoRequest,
  CreateEmpleadoResponse,
  EmpleadoDTO,
  MetricasEmpresaEmpleadosDTO,
  ResultadoCargaNominaDTO,
  UpdateEmpleadoMeRequest,
  UpdateEmpleadoRequest,
  VerificarPreRegistroRequest,
  VerificarPreRegistroResponse,
} from "../types/empleado";
import type { EmpleadoMeDTO } from "../types/adelanto";

export const empleadosEndpoints = {
  list: (params?: EmpleadosListParams) =>
    http.get<PaginatedResponse<EmpleadoDTO>>(buildEmpleadosListPath(params)),
  metricas: () =>
    http.get<MetricasEmpresaEmpleadosDTO>("/empleados/metricas/"),
  create: (data: CreateEmpleadoRequest) =>
    http.post<CreateEmpleadoResponse>("/empleados/", data),
  update: (empleadoId: string, data: UpdateEmpleadoRequest) =>
    http.put<EmpleadoDTO>(`/empleados/${empleadoId}/`, data),
  login: (data: EmpleadoLoginRequest) =>
    http.post<EmpleadoLoginResponse>("/empleados/login/", data),
  verificarPreRegistro: async (data: VerificarPreRegistroRequest) =>
    normalizeVerificarPreRegistroResponse(
      await http.post<unknown>("/empleados/verificar-pre-registro/", data),
    ),
  activar: (data: ActivarEmpleadoRequest) =>
    http.post<ActivarEmpleadoResponse>("/empleados/activar/", data),
  listBancos: async () =>
    normalizeBancosList(await http.get<unknown>("/empleados/bancos/")),
  me: () => http.get<EmpleadoMeDTO>("/empleados/me/"),
  updateMe: (data: UpdateEmpleadoMeRequest) =>
    http.patch<EmpleadoDTO>("/empleados/me/", data),
  cargarNomina: (archivo: File) => {
    const formData = new FormData();
    formData.append("archivo", archivo);
    return http.postForm<ResultadoCargaNominaDTO>(
      "/empleados/cargar-nomina/",
      formData,
    );
  },
  /**
   * Suspende (desactiva) la cuenta del empleado.
   * POST /empleados/{id}/suspender/ → estado `inactivo`.
   */
  suspender: (empleadoId: string) =>
    http.post<EmpleadoDTO>(`/empleados/${empleadoId}/suspender/`),
  /**
   * Reactiva un empleado suspendido.
   * POST /empleados/{id}/reactivar/ → `activo` o `pre_registrado`.
   */
  reactivar: (empleadoId: string) =>
    http.post<EmpleadoDTO>(`/empleados/${empleadoId}/reactivar/`),
};