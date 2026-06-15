import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { rememberedCredentialsStorage } from "./rememberedCredentialsStorage";

describe("rememberedCredentialsStorage", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.stubGlobal("crypto", globalThis.crypto);
  });

  afterEach(() => {
    window.localStorage.clear();
    vi.unstubAllGlobals();
  });

  it("guarda y recupera credenciales cifradas", async () => {
    await rememberedCredentialsStorage.save("usuario@empresa.com", "MiClave123");

    expect(rememberedCredentialsStorage.hasSaved()).toBe(true);

    const loaded = await rememberedCredentialsStorage.load();
    expect(loaded).toEqual({
      email: "usuario@empresa.com",
      password: "MiClave123",
    });

    const raw = window.localStorage.getItem("cerebiia_remember_credentials");
    expect(raw).toBeTruthy();
    expect(raw).not.toContain("MiClave123");
  });

  it("normaliza el correo al guardar", async () => {
    await rememberedCredentialsStorage.save("  Usuario@Empresa.COM  ", "clave");

    const loaded = await rememberedCredentialsStorage.load();
    expect(loaded?.email).toBe("usuario@empresa.com");
  });

  it("elimina credenciales al limpiar", async () => {
    await rememberedCredentialsStorage.save("a@b.com", "123456");
    rememberedCredentialsStorage.clear();

    expect(rememberedCredentialsStorage.hasSaved()).toBe(false);
    expect(await rememberedCredentialsStorage.load()).toBeNull();
  });

  it("actualiza la contraseña solo si el correo coincide", async () => {
    await rememberedCredentialsStorage.save("usuario@empresa.com", "Anterior123");

    const updated = await rememberedCredentialsStorage.updatePasswordIfMatches(
      "usuario@empresa.com",
      "NuevaClave456",
    );
    expect(updated).toBe(true);

    const loaded = await rememberedCredentialsStorage.load();
    expect(loaded?.password).toBe("NuevaClave456");

    const skipped = await rememberedCredentialsStorage.updatePasswordIfMatches(
      "otro@empresa.com",
      "OtraClave789",
    );
    expect(skipped).toBe(false);
    expect((await rememberedCredentialsStorage.load())?.password).toBe(
      "NuevaClave456",
    );
  });
});
