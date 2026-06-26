// ⚠️ AGNOSTIC — configuración global de adelantos
import { http } from "../client";
import type { AdelantoConfiguracionDTO } from "../types/configuracion";

export const configuracionEndpoints = {
  getAdelantos: () =>
    http.get<AdelantoConfiguracionDTO>("/configuracion/"),
};
