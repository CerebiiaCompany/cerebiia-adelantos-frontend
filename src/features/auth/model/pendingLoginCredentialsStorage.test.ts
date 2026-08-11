import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { pendingLoginCredentialsStorage } from "./pendingLoginCredentialsStorage";

describe("pendingLoginCredentialsStorage", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });

  afterEach(() => {
    window.sessionStorage.clear();
  });

  it("guarda y consume credenciales de un solo uso", () => {
    pendingLoginCredentialsStorage.set({
      loginType: "empleado",
      identifier: "1541511151",
      password: "NuevaClave123",
    });

    expect(pendingLoginCredentialsStorage.peek()).toEqual({
      loginType: "empleado",
      identifier: "1541511151",
      password: "NuevaClave123",
    });

    expect(pendingLoginCredentialsStorage.consume()).toEqual({
      loginType: "empleado",
      identifier: "1541511151",
      password: "NuevaClave123",
    });
    expect(pendingLoginCredentialsStorage.peek()).toBeNull();
  });
});
