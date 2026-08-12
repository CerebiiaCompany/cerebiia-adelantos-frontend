import { http } from "../client";
import type {
  ListadoNotificacionesDTO,
  MarcarLeidasRequest,
  MarcarLeidasResponse,
} from "../types/notificacion";

export const notificacionesEndpoints = {
  listMe: (params?: { unread_only?: boolean }) => {
    const search = new URLSearchParams();
    if (params?.unread_only) search.set("unread_only", "true");
    const query = search.toString();
    return http.get<ListadoNotificacionesDTO>(
      query ? `/notificaciones/me/?${query}` : "/notificaciones/me/",
    );
  },
  marcarLeidas: (body: MarcarLeidasRequest) =>
    http.post<MarcarLeidasResponse>("/notificaciones/me/marcar-leidas/", body),
  marcarTodasLeidas: () =>
    http.post<MarcarLeidasResponse>(
      "/notificaciones/me/marcar-todas-leidas/",
      {},
    ),
};
