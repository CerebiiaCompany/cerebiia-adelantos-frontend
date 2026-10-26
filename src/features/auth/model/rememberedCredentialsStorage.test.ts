import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { rememberedCredentialsStorage } from "./rememberedCredentialsStorage";

const STORAGE_KEY = "cerebiia_remember_credentials";
const LEGACY_CRYPTO_KEY = "cerebiia_remember_crypto_key";

describe("rememberedCredentialsStorage", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    window.localStorage.clear();
  });

  it("guarda y recupera solo el usuario del empleado, nunca la contraseña", async () => {
    await rememberedCredentialsStorage.save("empleado", "1020304050");

    expect(rememberedCredentialsStorage.hasSaved()).toBe(true);
    expect(await rememberedCredentialsStorage.load()).toEqual({
      loginType: "empleado",
      identifier: "1020304050",
    });
    expect(window.localStorage.getItem(STORAGE_KEY)).not.toMatch(/password/i);
  });

  it("normaliza el correo de empresa al guardar", async () => {
    await rememberedCredentialsStorage.save("empresa", "  Admin@Empresa.COM ");

    const loaded = await rememberedCredentialsStorage.load();
    expect(loaded?.identifier).toBe("admin@empresa.com");
  });

  it("loadForType solo devuelve credenciales del tipo solicitado", async () => {
    await rememberedCredentialsStorage.save("empresa", "admin@empresa.com");

    expect(await rememberedCredentialsStorage.loadForType("empresa")).toEqual({
      loginType: "empresa",
      identifier: "admin@empresa.com",
    });
    expect(await rememberedCredentialsStorage.loadForType("empleado")).toBeNull();
  });

  it("migra registros antiguos: conserva el usuario y borra la contraseña cifrada y su clave", async () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        v: 3,
        loginType: "empresa",
        identifier: "admin@empresa.com",
        passwordCipher: '{"iv":"abc","data":"def"}',
      }),
    );
    window.localStorage.setItem(LEGACY_CRYPTO_KEY, "clave-aes-base64");

    expect(await rememberedCredentialsStorage.load()).toEqual({
      loginType: "empresa",
      identifier: "admin@empresa.com",
    });
    expect(window.localStorage.getItem(LEGACY_CRYPTO_KEY)).toBeNull();
    expect(window.localStorage.getItem(STORAGE_KEY)).not.toContain("passwordCipher");
  });

  it("migra el formato v2 de empleados", async () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ v: 2, username: "1020304050", passwordCipher: "x" }),
    );

    expect(await rememberedCredentialsStorage.load()).toEqual({
      loginType: "empleado",
      identifier: "1020304050",
    });
    expect(window.localStorage.getItem(STORAGE_KEY)).not.toContain("passwordCipher");
  });

  it("clear elimina el usuario recordado y cualquier clave antigua", async () => {
    await rememberedCredentialsStorage.save("empleado", "1020304050");
    window.localStorage.setItem(LEGACY_CRYPTO_KEY, "clave-aes-base64");

    rememberedCredentialsStorage.clear();

    expect(rememberedCredentialsStorage.hasSaved()).toBe(false);
    expect(window.localStorage.getItem(LEGACY_CRYPTO_KEY)).toBeNull();
  });
});
