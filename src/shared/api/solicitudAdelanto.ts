// ⚠️ AGNOSTIC — adelanto solicitud helpers

import type { EstadoSolicitud } from "./types/adelanto";

export function isSolicitudCancellable(estado: EstadoSolicitud): boolean {
  return estado === "solicitado" || estado === "en_revision";
}
