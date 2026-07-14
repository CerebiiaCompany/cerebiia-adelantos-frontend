// ⚠️ AGNOSTIC — adelanto solicitud helpers

import type { EstadoSolicitud } from "./types/adelanto";

/**
 * El backend no expone POST /adelantos/solicitudes/{id}/cancelar/.
 * Mantener siempre false hasta que exista el endpoint.
 */
export function isSolicitudCancellable(_estado: EstadoSolicitud): boolean {
  return false;
}
