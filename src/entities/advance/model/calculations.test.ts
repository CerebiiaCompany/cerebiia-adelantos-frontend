import { describe, expect, it } from "vitest";
import {
  buildAdvanceQuickAmounts,
  resolveAdvanceAmountStep,
  snapAdvanceAmount,
} from "./calculations";

describe("resolveAdvanceAmountStep", () => {
  it("usa step fino cuando el cupo es menor a 50.000", () => {
    expect(resolveAdvanceAmountStep(10_000)).toBe(1_000);
    expect(resolveAdvanceAmountStep(49_999)).toBe(1_000);
  });

  it("usa step estándar para cupos grandes", () => {
    expect(resolveAdvanceAmountStep(50_000)).toBe(50_000);
    expect(resolveAdvanceAmountStep(510_000)).toBe(50_000);
  });
});

describe("snapAdvanceAmount", () => {
  it("permite seleccionar el saldo completo aunque no sea múltiplo del step estándar", () => {
    expect(snapAdvanceAmount(10_000, 10_000)).toBe(10_000);
    expect(snapAdvanceAmount(12_345, 10_000)).toBe(10_000);
  });

  it("redondea con step fino en cupos pequeños", () => {
    expect(snapAdvanceAmount(5_500, 10_000)).toBe(6_000);
    expect(snapAdvanceAmount(4_400, 10_000)).toBe(4_000);
  });
});

describe("buildAdvanceQuickAmounts", () => {
  it("calcula 20%, 30%, 50% y 100% del cupo disponible", () => {
    expect(buildAdvanceQuickAmounts(510_000)).toEqual([
      100_000,
      150_000,
      250_000,
      510_000,
    ]);
  });

  it("calcula montos útiles cuando el cupo es menor al step estándar", () => {
    expect(buildAdvanceQuickAmounts(10_000)).toEqual([
      2_000,
      3_000,
      5_000,
      10_000,
    ]);
  });

  it("retorna arreglo vacío si no hay cupo", () => {
    expect(buildAdvanceQuickAmounts(0)).toEqual([]);
  });
});
