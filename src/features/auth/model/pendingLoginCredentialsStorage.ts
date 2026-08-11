import type { RememberedLoginType } from "./rememberedCredentialsStorage";

const PENDING_LOGIN_CREDENTIALS_KEY = "cerebiia_pending_login_credentials";

export interface PendingLoginCredentials {
  loginType: RememberedLoginType;
  identifier: string;
  password: string;
}

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.sessionStorage !== "undefined";
}

/**
 * Credenciales de un solo uso (sessionStorage) tras activar cuenta.
 * Prefill en login; NO persisten como "Recordarme" hasta que el usuario lo marque
 * y complete el ingreso.
 */
export const pendingLoginCredentialsStorage = {
  set(credentials: PendingLoginCredentials): void {
    if (!isBrowser()) return;
    window.sessionStorage.setItem(
      PENDING_LOGIN_CREDENTIALS_KEY,
      JSON.stringify({
        loginType: credentials.loginType,
        identifier: credentials.identifier.trim(),
        password: credentials.password,
      }),
    );
  },

  peek(): PendingLoginCredentials | null {
    if (!isBrowser()) return null;
    const raw = window.sessionStorage.getItem(PENDING_LOGIN_CREDENTIALS_KEY);
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw) as PendingLoginCredentials;
      if (
        (parsed.loginType !== "empleado" && parsed.loginType !== "empresa") ||
        !parsed.identifier?.trim() ||
        typeof parsed.password !== "string"
      ) {
        return null;
      }
      return {
        loginType: parsed.loginType,
        identifier: parsed.identifier.trim(),
        password: parsed.password,
      };
    } catch {
      return null;
    }
  },

  /** Lee y elimina (un solo uso al abrir el login). */
  consume(): PendingLoginCredentials | null {
    const value = this.peek();
    this.clear();
    return value;
  },

  clear(): void {
    if (!isBrowser()) return;
    window.sessionStorage.removeItem(PENDING_LOGIN_CREDENTIALS_KEY);
  },
};
