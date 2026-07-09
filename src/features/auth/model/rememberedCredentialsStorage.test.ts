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

  it("guarda y recupera credenciales cifradas de empleado", async () => {
    await rememberedCredentialsStorage.save("empleado", "1020304050", "MiClave123");

    expect(rememberedCredentialsStorage.hasSaved()).toBe(true);

    const loaded = await rememberedCredentialsStorage.load();
    expect(loaded).toEqual({
      loginType: "empleado",
      identifier: "1020304050",
      password: "MiClave123",
    });
  });

  it("normaliza el correo de empresa al guardar", async () => {
    await rememberedCredentialsStorage.save(
      "empresa",
      "  Admin@Empresa.COM ",
      "clave",
    );

    const loaded = await rememberedCredentialsStorage.load();
    expect(loaded?.identifier).toBe("admin@empresa.com");
  });

  it("actualiza la contraseña solo si el identificador coincide", async () => {
    await rememberedCredentialsStorage.save("empleado", "1020304050", "Anterior123");

    const updated = await rememberedCredentialsStorage.updatePasswordIfMatches(
      "empleado",
      "1020304050",
      "NuevaClave456",
    );
    expect(updated).toBe(true);
    expect((await rememberedCredentialsStorage.load())?.password).toBe(
      "NuevaClave456",
    );
  });

  it("loadForType solo devuelve credenciales del tipo solicitado", async () => {
    await rememberedCredentialsStorage.save(
      "empresa",
      "admin@empresa.com",
      "clave",
    );

    expect(await rememberedCredentialsStorage.loadForType("empresa")).toEqual({
      loginType: "empresa",
      identifier: "admin@empresa.com",
      password: "clave",
    });
    expect(await rememberedCredentialsStorage.loadForType("empleado")).toBeNull();
  });
});
