const CREDENTIALS_STORAGE_KEY = "cerebiia_remember_credentials";
const CRYPTO_KEY_STORAGE = "cerebiia_remember_crypto_key";
const STORAGE_VERSION = 1;

interface StoredRememberedCredentials {
  v: number;
  email: string;
  passwordCipher: string;
}

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary);
}

function base64ToBytes(value: string): Uint8Array {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

async function getOrCreateCryptoKey(): Promise<CryptoKey> {
  const existing = window.localStorage.getItem(CRYPTO_KEY_STORAGE);
  if (existing) {
    return crypto.subtle.importKey(
      "raw",
      base64ToBytes(existing),
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt", "decrypt"],
    );
  }

  const key = await crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"],
  );
  const exported = await crypto.subtle.exportKey("raw", key);
  window.localStorage.setItem(
    CRYPTO_KEY_STORAGE,
    bytesToBase64(new Uint8Array(exported)),
  );
  return key;
}

async function encryptText(value: string): Promise<string> {
  const key = await getOrCreateCryptoKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(value);
  const cipher = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, encoded);

  return JSON.stringify({
    iv: bytesToBase64(iv),
    data: bytesToBase64(new Uint8Array(cipher)),
  });
}

async function decryptText(payload: string): Promise<string> {
  const parsed = JSON.parse(payload) as { iv: string; data: string };
  const key = await getOrCreateCryptoKey();
  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: base64ToBytes(parsed.iv) },
    key,
    base64ToBytes(parsed.data),
  );

  return new TextDecoder().decode(decrypted);
}

export interface RememberedCredentials {
  email: string;
  password: string;
}

export const rememberedCredentialsStorage = {
  hasSaved(): boolean {
    if (!isBrowser()) return false;
    return Boolean(window.localStorage.getItem(CREDENTIALS_STORAGE_KEY));
  },

  async save(email: string, password: string): Promise<void> {
    if (!isBrowser()) return;

    const normalizedEmail = email.trim().toLowerCase();
    const passwordCipher = await encryptText(password);
    const payload: StoredRememberedCredentials = {
      v: STORAGE_VERSION,
      email: normalizedEmail,
      passwordCipher,
    };

    window.localStorage.setItem(
      CREDENTIALS_STORAGE_KEY,
      JSON.stringify(payload),
    );
  },

  async load(): Promise<RememberedCredentials | null> {
    if (!isBrowser()) return null;

    const raw = window.localStorage.getItem(CREDENTIALS_STORAGE_KEY);
    if (!raw) return null;

    try {
      const parsed = JSON.parse(raw) as StoredRememberedCredentials;
      if (parsed.v !== STORAGE_VERSION || !parsed.email || !parsed.passwordCipher) {
        return null;
      }

      const password = await decryptText(parsed.passwordCipher);
      return {
        email: parsed.email,
        password,
      };
    } catch {
      this.clear();
      return null;
    }
  },

  clear(): void {
    if (!isBrowser()) return;
    window.localStorage.removeItem(CREDENTIALS_STORAGE_KEY);
  },

  /** Actualiza la contraseña guardada si el correo coincide (cambio o restablecimiento). */
  async updatePasswordIfMatches(
    email: string,
    newPassword: string,
  ): Promise<boolean> {
    const saved = await this.load();
    if (!saved) return false;

    const normalizedEmail = email.trim().toLowerCase();
    if (saved.email !== normalizedEmail) return false;

    await this.save(normalizedEmail, newPassword);
    return true;
  },
};
