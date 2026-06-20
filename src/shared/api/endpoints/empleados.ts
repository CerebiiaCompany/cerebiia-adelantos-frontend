// ⚠️ AGNOSTIC — no react-router-dom, no react-dom, no UI imports

import { http } from "../client";
import type {
  EmpleadoLoginRequest,
  EmpleadoLoginResponse,
} from "../types/auth";
import type {
  ActivarEmpleadoRequest,
  ActivarEmpleadoResponse,
  CreateEmpleadoRequest,
  CreateEmpleadoResponse,
  EmpleadoDTO,
  VerificarPreRegistroRequest,
  VerificarPreRegistroResponse,
} from "../types/empleado";

export const empleadosEndpoints = {
  list: () => http.get<EmpleadoDTO[]>("/empleados/"),
  create: (data: CreateEmpleadoRequest) =>
    http.post<CreateEmpleadoResponse>("/empleados/", data),
  login: (data: EmpleadoLoginRequest) =>
    http.post<EmpleadoLoginResponse>("/empleados/login/", data),
  verificarPreRegistro: (data: VerificarPreRegistroRequest) =>
    http.post<VerificarPreRegistroResponse>(
      "/empleados/verificar-pre-registro/",
      data,
    ),
  activar: (data: ActivarEmpleadoRequest) =>
    http.post<ActivarEmpleadoResponse>("/empleados/activar/", data),
  deactivate: (empleadoId: string) =>
    http.post<EmpleadoDTO>(`/empleados/${empleadoId}/desactivar/`),
};
