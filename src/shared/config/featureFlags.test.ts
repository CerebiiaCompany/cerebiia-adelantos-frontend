import { afterEach, describe, expect, it, vi } from "vitest";
import { isAdelantoDateWindowBypassed } from "./featureFlags";

describe("isAdelantoDateWindowBypassed", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("respeta la ventana de fechas por defecto", () => {
    vi.stubEnv("VITE_BYPASS_ADELANTO_DATE_WINDOW", "");
    expect(isAdelantoDateWindowBypassed()).toBe(false);
  });

  it("omite la ventana con VITE_BYPASS_ADELANTO_DATE_WINDOW=true", () => {
    vi.stubEnv("VITE_BYPASS_ADELANTO_DATE_WINDOW", "true");
    expect(isAdelantoDateWindowBypassed()).toBe(true);
  });
});
