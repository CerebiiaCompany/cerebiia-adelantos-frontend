import { http } from "../client";
import type {
  ActualizarLogroRequest,
  CrearLogroRequest,
  LogroAdminDTO,
  LogrosEmpleadoSnapshotDTO,
} from "../types/logro";

export const logrosEndpoints = {
  listAdmin: () => http.get<LogroAdminDTO[]>("/logros/"),
  create: (body: CrearLogroRequest) =>
    http.post<LogroAdminDTO>("/logros/", body),
  get: (logroId: string) => http.get<LogroAdminDTO>(`/logros/${logroId}/`),
  update: (logroId: string, body: ActualizarLogroRequest) =>
    http.patch<LogroAdminDTO>(`/logros/${logroId}/`, body),
  remove: (logroId: string, hard = false) => {
    const path = hard
      ? `/logros/${logroId}/?hard=true`
      : `/logros/${logroId}/`;
    return http.del<LogroAdminDTO | void>(path);
  },
  me: () => http.get<LogrosEmpleadoSnapshotDTO>("/logros/me/"),
};
