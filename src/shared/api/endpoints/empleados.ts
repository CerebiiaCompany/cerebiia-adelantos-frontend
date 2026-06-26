// ⚠️ AGNOSTIC — no react-router-dom, no react-dom, no UI imports

import { http } from "../client";
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
  ResultadoCargaNominaDTO,
  UpdateEmpleadoMeRequest,
  VerificarPreRegistroRequest,
  VerificarPreRegistroResponse,
} from "../types/empleado";
import type { EmpleadoMeDTO } from "../types/adelanto";

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
  listBancos: () => http.get<BancoDTO[]>("/empleados/bancos/"),
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
   * @deprecated El backend aún no expone desactivación de empleados.
   */
  deactivate: (empleadoId: string) =>
    http.post<EmpleadoDTO>(`/empleados/${empleadoId}/desactivar/`),
};
