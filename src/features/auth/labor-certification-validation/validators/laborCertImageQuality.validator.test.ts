import { describe, expect, it } from "vitest";
import { meetsLaborCertCriticalResolution } from "./laborCertImageQuality.validator";

describe("meetsLaborCertCriticalResolution", () => {
  it("acepta imágenes por debajo del estándar recomendado de 1000x600", () => {
    expect(meetsLaborCertCriticalResolution(640, 480)).toBe(true);
  });

  it("rechaza imágenes demasiado pequeñas", () => {
    expect(meetsLaborCertCriticalResolution(200, 150)).toBe(false);
  });
});
