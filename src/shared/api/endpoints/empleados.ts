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
  CarteraPendienteEmpleadoDTO,
  CreateEmpleadoRequest,
  CreateEmpleadoResponse,
  EmpleadoDTO,
  ListadoAuditoriaCambioDTO,
  ListadoReporteDatoIncorrectoDTO,
  MetricasEmpresaEmpleadosDTO,
  ReporteDatoIncorrectoDTO,
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
  listAuditoriaCambiosMe: (params?: { page?: number; page_size?: number }) => {
    const search = new URLSearchParams();
    if (params?.page) search.set("page", String(params.page));
    if (params?.page_size) search.set("page_size", String(params.page_size));
    const query = search.toString();
    return http.get<ListadoAuditoriaCambioDTO>(
      `/empleados/me/auditoria-cambios/${query ? `?${query}` : ""}`,
    );
  },
  listAuditoriaCambiosEmpresa: (params?: {
    page?: number;
    page_size?: number;
    empleado_id?: string;
  }) => {
    const search = new URLSearchParams();
    if (params?.page) search.set("page", String(params.page));
    if (params?.page_size) search.set("page_size", String(params.page_size));
    if (params?.empleado_id) search.set("empleado_id", params.empleado_id);
    const query = search.toString();
    return http.get<ListadoAuditoriaCambioDTO>(
      `/empleados/auditoria-cambios/${query ? `?${query}` : ""}`,
    );
  },
  createReporteDatoIncorrecto: (payload: {
    campos_reportados: string[];
    mensaje: string;
    evidencias?: File[];
  }) => {
    const formData = new FormData();
    formData.append("mensaje", payload.mensaje);
    formData.append(
      "campos_reportados",
      JSON.stringify(payload.campos_reportados),
    );
    if (payload.evidencias && payload.evidencias.length > 0) {
      payload.evidencias.forEach((file) => {
        formData.append("evidencias", file);
      });
    }
    return http.postForm<ReporteDatoIncorrectoDTO>(
      "/empleados/me/reportes-datos/",
      formData,
    );
  },
  listReportesDatoIncorrectoMe: (params?: {
    page?: number;
    page_size?: number;
  }) => {
    const search = new URLSearchParams();
    if (params?.page) search.set("page", String(params.page));
    if (params?.page_size) search.set("page_size", String(params.page_size));
    const query = search.toString();
    return http.get<ListadoReporteDatoIncorrectoDTO>(
      `/empleados/me/reportes-datos/${query ? `?${query}` : ""}`,
    );
  },
  listReportesDatoIncorrectoEmpresa: (params?: {
    page?: number;
    page_size?: number;
    estado?: string;
  }) => {
    const search = new URLSearchParams();
    if (params?.page) search.set("page", String(params.page));
    if (params?.page_size) search.set("page_size", String(params.page_size));
    if (params?.estado) search.set("estado", params.estado);
    const query = search.toString();
    return http.get<ListadoReporteDatoIncorrectoDTO>(
      `/empleados/reportes-datos/${query ? `?${query}` : ""}`,
    );
  },
  enviarMensajeReporteDatoIncorrectoMe: (
    reporteId: string,
    payload: { mensaje: string; evidencias?: File[] },
  ) => {
    if (payload.evidencias && payload.evidencias.length > 0) {
      const formData = new FormData();
      formData.append("mensaje", payload.mensaje);
      payload.evidencias.forEach((file) => {
        formData.append("evidencias", file);
      });
      return http.postForm<ReporteDatoIncorrectoDTO>(
        `/empleados/me/reportes-datos/${reporteId}/mensajes/`,
        formData,
      );
    }
    return http.post<ReporteDatoIncorrectoDTO>(
      `/empleados/me/reportes-datos/${reporteId}/mensajes/`,
      { mensaje: payload.mensaje },
    );
  },
  responderReporteDatoIncorrecto: (reporteId: string, respuesta: string) =>
    http.post<ReporteDatoIncorrectoDTO>(
      `/empleados/reportes-datos/${reporteId}/responder/`,
      { respuesta },
    ),
  finalizarReporteDatoIncorrecto: (reporteId: string, conclusion?: string) =>
    http.post<ReporteDatoIncorrectoDTO>(
      `/empleados/reportes-datos/${reporteId}/finalizar/`,
      { conclusion: conclusion || "Caso finalizado por la empresa", estado: "resuelto" },
    ),
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
   * Cartera pendiente (cuotas por descontar) para saneamiento.
   * GET /empleados/{id}/cartera-pendiente/
   */
  carteraPendiente: (empleadoId: string) =>
    http.get<CarteraPendienteEmpleadoDTO>(
      `/empleados/${empleadoId}/cartera-pendiente/`,
    ),
  /**
   * Reactiva un empleado suspendido.
   * POST /empleados/{id}/reactivar/ → `activo` o `pre_registrado`.
   */
  reactivar: (empleadoId: string) =>
    http.post<EmpleadoDTO>(`/empleados/${empleadoId}/reactivar/`),
};