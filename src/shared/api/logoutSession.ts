// ⚠️ AGNOSTIC — revoca tokens JWT en backend y prepara cierre de sesión local

import { authEndpoints } from "./endpoints/auth";
import { authStorage } from "./authStorage";
import { getApiBaseUrl } from "./client";

/**
 * Invalida access y refresh en el backend (denylist Redis).
 * Best-effort: no lanza error si el servidor falla o el token ya expiró.
 */
export async function logoutAuthSession(): Promise<void> {
  const session = authStorage.get();
  const apiUrl = getApiBaseUrl();

  if (!session?.refreshToken || !apiUrl) {
    return;
  }

  try {
    await authEndpoints.logout({ refresh: session.refreshToken });
  } catch {
    // El cliente siempre limpia el almacenamiento local tras el logout.
  }
}
