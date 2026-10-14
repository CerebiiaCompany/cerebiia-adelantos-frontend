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

  it("usa step de 10.000 cuando minAmount no es múltiplo de 50.000", () => {
    expect(resolveAdvanceAmountStep(238_000, 20_000)).toBe(10_000);
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

  it("permite seleccionar exactamente el monto mínimo configurado sin redondearlo a 0", () => {
    expect(snapAdvanceAmount(20_000, 238_000, 20_000)).toBe(20_000);
    expect(snapAdvanceAmount(19_000, 238_000, 20_000)).toBe(20_000);
    expect(snapAdvanceAmount(8_000, 40_000, 20_000)).toBe(20_000);
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

  it("filtra montos menores al mínimo configurado y no ofrece valores inferiores al umbral", () => {
    const quick = buildAdvanceQuickAmounts(40_000, 20_000);
    expect(quick.every((amount) => amount >= 20_000)).toBe(true);
    expect(quick).toContain(20_000);
    expect(quick).toContain(40_000);
    expect(quick).not.toContain(8_000);
    expect(quick).not.toContain(12_000);
    expect(quick).not.toContain(4_000);
    expect(quick).not.toContain(6_000);
  });

  it("para cupo grande con mínimo configurado, incluye el mínimo exacto", () => {
    const quick = buildAdvanceQuickAmounts(238_000, 20_000);
    expect(quick[0]).toBe(20_000);
    expect(quick).toContain(238_000);
  });

  it("para cupo igual al mínimo, ofrece únicamente el valor mínimo", () => {
    expect(buildAdvanceQuickAmounts(20_000, 20_000)).toEqual([20_000]);
  });

  it("retorna arreglo vacío si el saldo disponible es menor al mínimo configurado", () => {
    expect(buildAdvanceQuickAmounts(19_000, 20_000)).toEqual([]);
  });
});
