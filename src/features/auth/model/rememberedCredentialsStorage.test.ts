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
    await rememberedCredentialsStorage.save("1020304050", "MiClave123");

    expect(rememberedCredentialsStorage.hasSaved()).toBe(true);

    const loaded = await rememberedCredentialsStorage.load();
    expect(loaded).toEqual({
      username: "1020304050",
      password: "MiClave123",
    });

    const raw = window.localStorage.getItem("cerebiia_remember_credentials");
    expect(raw).toBeTruthy();
    expect(raw).not.toContain("MiClave123");
  });

  it("normaliza el usuario al guardar", async () => {
    await rememberedCredentialsStorage.save("  1020304050  ", "clave");

    const loaded = await rememberedCredentialsStorage.load();
    expect(loaded?.username).toBe("1020304050");
  });

  it("elimina credenciales al limpiar", async () => {
    await rememberedCredentialsStorage.save("1020304050", "123456");
    rememberedCredentialsStorage.clear();

    expect(rememberedCredentialsStorage.hasSaved()).toBe(false);
    expect(await rememberedCredentialsStorage.load()).toBeNull();
  });

  it("actualiza la contraseña solo si el usuario coincide", async () => {
    await rememberedCredentialsStorage.save("1020304050", "Anterior123");

    const updated = await rememberedCredentialsStorage.updatePasswordIfMatches(
      "1020304050",
      "NuevaClave456",
    );
    expect(updated).toBe(true);

    const loaded = await rememberedCredentialsStorage.load();
    expect(loaded?.password).toBe("NuevaClave456");

    const skipped = await rememberedCredentialsStorage.updatePasswordIfMatches(
      "9988776655",
      "OtraClave789",
    );
    expect(skipped).toBe(false);
    expect((await rememberedCredentialsStorage.load())?.password).toBe(
      "NuevaClave456",
    );
  });
});
