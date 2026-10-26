const CREDENTIALS_STORAGE_KEY = "cerebiia_remember_credentials";
/** Versiones anteriores guardaban aquí la clave AES de la contraseña; solo se usa para borrarla. */
const LEGACY_CRYPTO_KEY_STORAGE = "cerebiia_remember_crypto_key";
const STORAGE_VERSION = 4;

export type RememberedLoginType = "empleado" | "empresa";

/**
 * "Recordarme" solo conserva el tipo de acceso y el usuario (documento o correo).
 * La contraseña nunca se persiste en el navegador: cifrarla con una clave guardada
 * junto a ella no la protege ante XSS ni ante acceso al equipo. Para recordarla,
 * el usuario puede usar el gestor de contraseñas del navegador.
 */
export interface RememberedCredentials {
  loginType: RememberedLoginType;
  identifier: string;
}

interface StoredRememberedCredentials {
  v: number;
  loginType?: RememberedLoginType;
  identifier?: string;
  /** v2 (solo empleados) usaba `username`. */
  username?: string;
}

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function normalizeIdentifier(
  loginType: RememberedLoginType,
  identifier: string,
): string {
  const trimmed = identifier.trim();
  return loginType === "empresa" ? trimmed.toLowerCase() : trimmed;
}

function write(credentials: RememberedCredentials): void {
  window.localStorage.setItem(
    CREDENTIALS_STORAGE_KEY,
    JSON.stringify({ v: STORAGE_VERSION, ...credentials }),
  );
}

/** Convierte un registro de versiones anteriores (con contraseña cifrada) al formato actual. */
function migrateLegacy(parsed: StoredRememberedCredentials): RememberedCredentials | null {
  if (parsed.loginType && parsed.identifier) {
    return { loginType: parsed.loginType, identifier: parsed.identifier };
  }
  if (parsed.username) {
    return { loginType: "empleado", identifier: parsed.username };
  }
  return null;
}

export const rememberedCredentialsStorage = {
  hasSaved(): boolean {
    if (!isBrowser()) return false;
    return Boolean(window.localStorage.getItem(CREDENTIALS_STORAGE_KEY));
  },

  async save(loginType: RememberedLoginType, identifier: string): Promise<void> {
    if (!isBrowser()) return;
    window.localStorage.removeItem(LEGACY_CRYPTO_KEY_STORAGE);
    write({ loginType, identifier: normalizeIdentifier(loginType, identifier) });
  },

  async load(): Promise<RememberedCredentials | null> {
    if (!isBrowser()) return null;
    window.localStorage.removeItem(LEGACY_CRYPTO_KEY_STORAGE);

    const raw = window.localStorage.getItem(CREDENTIALS_STORAGE_KEY);
    if (!raw) return null;

    try {
      const parsed = JSON.parse(raw) as StoredRememberedCredentials;
      const credentials = migrateLegacy(parsed);
      if (!credentials) {
        this.clear();
        return null;
      }
      // Reescribe registros antiguos para eliminar la contraseña cifrada.
      if (parsed.v !== STORAGE_VERSION) write(credentials);
      return credentials;
    } catch {
      this.clear();
      return null;
    }
  },

  async loadForType(
    loginType: RememberedLoginType,
  ): Promise<RememberedCredentials | null> {
    const saved = await this.load();
    if (!saved || saved.loginType !== loginType) {
      return null;
    }
    return saved;
  },

  clear(): void {
    if (!isBrowser()) return;
    window.localStorage.removeItem(CREDENTIALS_STORAGE_KEY);
    window.localStorage.removeItem(LEGACY_CRYPTO_KEY_STORAGE);
  },
};
